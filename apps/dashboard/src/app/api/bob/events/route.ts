import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Get the project root path
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  return path.resolve(process.cwd(), '..', '..');
}

const BOB_STATUS_FILE_NAME = '.aios/dashboard/bob-status.json';
const POLL_INTERVAL = 1000; // Poll every 1 second (per story spec)

// Event types for Bob SSE
type BobEventType = 'bob:status' | 'bob:connected' | 'heartbeat' | 'error';

interface SSEEvent {
  type: BobEventType;
  data: unknown;
  timestamp: string;
}

function formatSSE(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: NextRequest) {
  const projectRoot = getProjectRoot();
  const statusFilePath = path.join(projectRoot, BOB_STATUS_FILE_NAME);

  const encoder = new TextEncoder();
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let isStreamActive = true;
  let lastContent: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SSEEvent) => {
        if (!isStreamActive) return;
        try {
          controller.enqueue(encoder.encode(formatSSE(event)));
        } catch {
          isStreamActive = false;
        }
      };

      const readAndSendStatus = async (force = false) => {
        try {
          const content = await fs.readFile(statusFilePath, 'utf-8');

          if (force || content !== lastContent) {
            lastContent = content;
            const data = JSON.parse(content);
            sendEvent({
              type: 'bob:status',
              data: {
                active: data.orchestration?.active ?? false,
                ...data,
              },
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            if (force || lastContent !== null) {
              lastContent = null;
              sendEvent({
                type: 'bob:status',
                data: { active: false, message: 'Bob is not running' },
                timestamp: new Date().toISOString(),
              });
            }
          } else {
            sendEvent({
              type: 'error',
              data: { message: 'Failed to read bob-status file' },
              timestamp: new Date().toISOString(),
            });
          }
        }
      };

      // Initial connection event
      sendEvent({
        type: 'bob:connected',
        data: { connected: true },
        timestamp: new Date().toISOString(),
      });

      // Send initial status
      await readAndSendStatus(true);

      // Poll for changes every 1s
      pollInterval = setInterval(async () => {
        if (!isStreamActive) return;
        await readAndSendStatus();
      }, POLL_INTERVAL);

      // Heartbeat every 30s
      heartbeatInterval = setInterval(() => {
        sendEvent({
          type: 'heartbeat',
          data: { alive: true },
          timestamp: new Date().toISOString(),
        });
      }, 30000);
    },

    cancel() {
      isStreamActive = false;
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    },
  });

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    isStreamActive = false;
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
