'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { X, RefreshCw, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTerminalStore, type Terminal, type TerminalLine } from '@/stores/terminal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AGENT_CONFIG, type AgentId } from '@/types';

// ANSI color map for basic terminal colors
const ANSI_COLORS: Record<string, string> = {
  '30': 'text-black',
  '31': 'text-red-500',
  '32': 'text-green-500',
  '33': 'text-yellow-500',
  '34': 'text-blue-500',
  '35': 'text-purple-500',
  '36': 'text-cyan-500',
  '37': 'text-white',
  '90': 'text-gray-500',
  '91': 'text-red-400',
  '92': 'text-green-400',
  '93': 'text-yellow-400',
  '94': 'text-blue-400',
  '95': 'text-purple-400',
  '96': 'text-cyan-400',
  '97': 'text-gray-200',
};

// Parse ANSI codes and return styled spans
function parseAnsiLine(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+)m/g;
  let lastIndex = 0;
  let currentColor = '';
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    // Add text before this code
    if (match.index > lastIndex) {
      const text = line.slice(lastIndex, match.index);
      parts.push(
        <span key={keyIndex++} className={currentColor}>
          {text}
        </span>
      );
    }

    // Update color
    const code = match[1];
    if (code === '0') {
      currentColor = '';
    } else if (code === '1') {
      currentColor = `${currentColor} font-bold`;
    } else if (ANSI_COLORS[code]) {
      currentColor = ANSI_COLORS[code];
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    parts.push(
      <span key={keyIndex++} className={currentColor}>
        {line.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [<span key={0}>{line}</span>];
}

interface TerminalStreamProps {
  terminalId: string;
  onClose?: () => void;
  className?: string;
}

export function TerminalStream({ terminalId, onClose, className }: TerminalStreamProps) {
  const {
    getTerminalById,
    setTerminalStatus,
    appendLine,
    clearTerminal,
  } = useTerminalStore();

  const terminal = getTerminalById(terminalId);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminal?.lines, autoScroll]);

  // Handle scroll to detect manual scrolling
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  // Connect to SSE
  const connect = useCallback(() => {
    if (!terminal) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setTerminalStatus(terminalId, 'connecting');

    const url = `/api/logs?agent=${terminal.agentId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setTerminalStatus(terminalId, 'connected');
    };

    eventSource.onerror = () => {
      setTerminalStatus(terminalId, 'error', 'Connection failed');
      eventSource.close();
      eventSourceRef.current = null;
    };

    // Handle log lines
    eventSource.addEventListener('log:line', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const lineData = parsed.data as { line: string; initial: boolean };
        appendLine(terminalId, {
          content: lineData.line,
          timestamp: parsed.timestamp,
          isInitial: lineData.initial,
        });
      } catch {
        // Failed to parse
      }
    });

    // Handle init
    eventSource.addEventListener('log:init', () => {
      // Clear old lines on reconnect
      clearTerminal(terminalId);
    });

    // Handle errors
    eventSource.addEventListener('log:error', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const error = (parsed.data as { message: string }).message;
        setTerminalStatus(terminalId, 'error', error);
      } catch {
        setTerminalStatus(terminalId, 'error', 'Unknown error');
      }
    });

    // Handle heartbeat
    eventSource.addEventListener('heartbeat', () => {
      // Connection is alive
    });
  }, [terminal, terminalId, setTerminalStatus, appendLine, clearTerminal]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setTerminalStatus(terminalId, 'disconnected');
  }, [terminalId, setTerminalStatus]);

  // Connect on mount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Reconnect handler
  const handleReconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  if (!terminal) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Terminal not found
      </div>
    );
  }

  const agentConfig = terminal.agentId !== 'main'
    ? AGENT_CONFIG[terminal.agentId as AgentId]
    : null;

  return (
    <div className={cn('flex flex-col h-full border border-border rounded-lg overflow-hidden bg-[#0d1117]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {agentConfig?.name || 'Main'} Logs
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              terminal.status === 'connected' && 'bg-green-500/20 text-green-500 border-green-500/50',
              terminal.status === 'connecting' && 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
              terminal.status === 'disconnected' && 'bg-gray-500/20 text-gray-500 border-gray-500/50',
              terminal.status === 'error' && 'bg-red-500/20 text-red-500 border-red-500/50'
            )}
          >
            {terminal.status}
          </Badge>
          {terminal.error && (
            <span className="text-xs text-red-500">{terminal.error}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReconnect}
            className="h-7 w-7 p-0"
            title="Reconnect"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', terminal.status === 'connecting' && 'animate-spin')} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-3 font-mono text-xs text-gray-300"
      >
        {terminal.lines.length === 0 ? (
          <div className="text-muted-foreground">
            Waiting for logs...
          </div>
        ) : (
          terminal.lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                'leading-relaxed',
                line.isInitial && 'opacity-70'
              )}
            >
              {parseAnsiLine(line.content)}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-t border-border">
        <div className="flex items-center gap-2">
          {agentConfig && (
            <>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: agentConfig.color }}
              />
              <span className="text-xs text-muted-foreground">
                @{agentConfig.name.toLowerCase()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{terminal.lines.length} lines</span>
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
              }}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              <ChevronDown className="h-3 w-3" />
              Scroll to bottom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
