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

const STATUS_FILE_NAME = '.aios/dashboard/status.json';
const POLL_INTERVAL = 2000; // Poll every 2 seconds

// Event types
type EventType = 'status:update' | 'connection:status' | 'heartbeat' | 'error';

interface SSEEvent {
  type: EventType;
  data: unknown;
  timestamp: string;
}

function formatSSE(event: SSEEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: NextRequest) {
  const projectRoot = getProjectRoot();
  const statusFilePath = path.join(projectRoot, STATUS_FILE_NAME);

  // Create readable stream for SSE
  const encoder = new TextEncoder();
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let isStreamActive = true;
  let lastContent: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send event
      const sendEvent = (event: SSEEvent) => {
        if (!isStreamActive) return;
        try {
          controller.enqueue(encoder.encode(formatSSE(event)));
        } catch {
          // Stream closed
          isStreamActive = false;
        }
      };

      // Helper to read and send status (only if changed)
      const readAndSendStatus = async (force = false) => {
        try {
          const content = await fs.readFile(statusFilePath, 'utf-8');

          // Only send if content changed or forced
          if (force || content !== lastContent) {
            lastContent = content;
            const data = JSON.parse(content);
            sendEvent({
              type: 'status:update',
              data,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // Only send disconnected state if we had content before or forced
            if (force || lastContent !== null) {
              lastContent = null;
              sendEvent({
                type: 'status:update',
                data: {
                  connected: false,
                  project: null,
                  activeAgent: null,
                  session: null,
                  stories: { inProgress: [], completed: [] },
                },
                timestamp: new Date().toISOString(),
              });
            }
          } else {
            sendEvent({
              type: 'error',
              data: { message: 'Failed to read status file' },
              timestamp: new Date().toISOString(),
            });
          }
        }
      };

      // Send initial connection event
      sendEvent({
        type: 'connection:status',
        data: { connected: true },
        timestamp: new Date().toISOString(),
      });

      // Send initial status (forced)
      await readAndSendStatus(true);

      // Setup polling for file changes (Turbopack-compatible alternative to chokidar)
      pollInterval = setInterval(async () => {
        if (!isStreamActive) return;
        await readAndSendStatus();
      }, POLL_INTERVAL);

      // Setup heartbeat (every 30 seconds)
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
