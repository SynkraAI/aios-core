'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Copy, ArrowDown, Pause, Play } from 'lucide-react';
import AnsiToHtml from 'ansi-to-html';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const converter = new AnsiToHtml({
  newline: true,
  escapeXML: true,
  colors: {
    0: '#1e1e1e',
    1: '#f44747',
    2: '#4ec9b0',
    3: '#dcdcaa',
    4: '#569cd6',
    5: '#c586c0',
    6: '#4fc1ff',
    7: '#d4d4d4',
  },
});

interface TerminalOutputProps {
  content: string;
  title?: string;
  className?: string;
}

export function TerminalOutput({
  content,
  title = 'Terminal',
  className,
}: TerminalOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert ANSI to HTML
  const html = converter.toHtml(content);

  // Highlight search matches
  const highlightedHtml = searchQuery
    ? html.replace(
        new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark class="bg-yellow-500/50 text-yellow-200">$1</mark>'
      )
    : html;

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, autoScroll]);

  // Handle manual scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  }, [autoScroll]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setAutoScroll(true);
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const selection = window.getSelection()?.toString();
    const textToCopy = selection || content;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }, [content]);

  // Toggle search
  const toggleSearch = useCallback(() => {
    setSearchVisible((prev) => !prev);
    if (searchVisible) {
      setSearchQuery('');
    }
  }, [searchVisible]);

  return (
    <div className={cn('flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-sm text-[#cccccc] ml-2">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSearch}
            className={cn(
              'h-7 w-7 p-0 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c]',
              searchVisible && 'bg-[#3c3c3c]'
            )}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Copy */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 p-0 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c]"
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* Auto-scroll toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              'h-7 w-7 p-0 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c]',
              autoScroll && 'text-green-400'
            )}
          >
            {autoScroll ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Scroll to bottom */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToBottom}
            className="h-7 w-7 p-0 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c]"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {searchVisible && (
        <div className="px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-2 py-1 text-sm bg-[#3c3c3c] border border-[#5c5c5c] rounded text-[#cccccc] placeholder-[#808080] focus:outline-none focus:border-[#007acc]"
            autoFocus
          />
        </div>
      )}

      {/* Terminal content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed"
      >
        {content ? (
          <pre
            className="whitespace-pre-wrap break-words text-[#d4d4d4]"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <div className="text-[#808080] italic">No output yet...</div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-xs">
        <span>{content.split('\n').length} lines</span>
        <div className="flex items-center gap-3">
          {copied && <span className="text-green-300">Copied!</span>}
          <span>{autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}</span>
        </div>
      </div>
    </div>
  );
}
