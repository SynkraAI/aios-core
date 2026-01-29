'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { TerminalOutput } from '@/components/terminal';
import { Button } from '@/components/ui/button';

// Demo content with ANSI codes
const DEMO_CONTENT = `\x1b[32m[INFO]\x1b[0m Starting AIOS Agent...
\x1b[34m[DEBUG]\x1b[0m Loading configuration from .aios/config.yaml
\x1b[32m[INFO]\x1b[0m Agent @dev activated
\x1b[33m[WARN]\x1b[0m No stories found in backlog
\x1b[32m[INFO]\x1b[0m Checking for pending tasks...

\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
\x1b[1m\x1b[35m  AIOS Dashboard - Terminal Output Viewer  \x1b[0m
\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m

\x1b[32m✓\x1b[0m Connected to project: \x1b[1maios-core\x1b[0m
\x1b[32m✓\x1b[0m Status file: .aios/dashboard/status.json
\x1b[32m✓\x1b[0m Stories directory: docs/stories/

\x1b[34m[DEBUG]\x1b[0m Polling interval: 5000ms
\x1b[32m[INFO]\x1b[0m Dashboard ready at http://localhost:3000

\x1b[31m[ERROR]\x1b[0m Example error message for testing
\x1b[33m[WARN]\x1b[0m Example warning message

\x1b[90m---\x1b[0m
\x1b[90mThis is a demo terminal output.\x1b[0m
\x1b[90mReal logs will appear here when AIOS CLI writes to log files.\x1b[0m
`;

export default function TerminalsPage() {
  const [content, setContent] = useState(DEMO_CONTENT);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      setContent((prev) => prev + `\n\x1b[90m[${timestamp}]\x1b[0m Heartbeat...`);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setContent(DEMO_CONTENT + `\n\x1b[32m[INFO]\x1b[0m Refreshed at ${new Date().toLocaleTimeString()}`);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Terminal Output</h1>
          <p className="text-sm text-muted-foreground">
            View agent execution logs and output
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-0">
        <TerminalOutput
          content={content}
          title="@dev - aios-core"
          className="h-full"
        />
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> Real-time terminal output requires AIOS CLI to write logs to a file.
          This feature will be fully functional when the CLI integration is complete.
        </p>
      </div>
    </div>
  );
}
