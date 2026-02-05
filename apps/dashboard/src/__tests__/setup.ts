import '@testing-library/jest-dom/vitest';

// Mock EventSource for jsdom (not available in jsdom)
class MockEventSource {
  url: string;
  readyState: number = 0;
  onopen: (() => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  private listeners: Record<string, Array<(e: MessageEvent) => void>> = {};

  constructor(url: string) {
    this.url = url;
    this.readyState = 1;
  }

  addEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  close() {
    this.readyState = 2;
  }
}

// Mock fetch for API calls
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  if (url.includes('/api/bob/status')) {
    return new Response(JSON.stringify({ active: false, message: 'Bob is not running' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (originalFetch) return originalFetch(input, init);
  return new Response('{}', { status: 200 });
};

globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
