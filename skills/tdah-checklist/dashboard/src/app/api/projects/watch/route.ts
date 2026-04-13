import { readFile, stat } from 'fs/promises';
import { parseRadar, OBSIDIAN_PATH } from '@/lib/parser';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  let watchInterval: ReturnType<typeof setInterval>;
  let lastMtime = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        if (closed) return;
        try {
          const fileStat = await stat(OBSIDIAN_PATH);
          const mtime = fileStat.mtimeMs;

          if (mtime <= lastMtime) return;
          lastMtime = mtime;

          const content = await readFile(OBSIDIAN_PATH, 'utf-8');
          const data = parseRadar(content);
          const payload = `data: ${JSON.stringify({ type: 'update', data, mtime })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // File temporarily unavailable (iCloud sync), skip
        }
      };

      // Send initial data
      await sendUpdate();

      // Poll file every 1.5s for changes
      watchInterval = setInterval(sendUpdate, 1500);

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          closed = true;
        }
      }, 30000);

      // Cleanup on close
      const cleanup = () => {
        closed = true;
        clearInterval(watchInterval);
        clearInterval(heartbeat);
      };

      // Store cleanup for cancel
      (controller as unknown as Record<string, () => void>)._cleanup = cleanup;
    },
    cancel() {
      closed = true;
      clearInterval(watchInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
