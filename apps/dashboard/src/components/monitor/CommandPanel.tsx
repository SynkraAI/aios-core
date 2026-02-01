'use client';

import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useMonitorStore, selectCurrentCommand, selectActiveAgent } from '@/stores/monitor-store';

interface CommandPanelProps {
  className?: string;
}

function formatElapsedTime(startedAt: number): string {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  if (elapsed < 60) return `${elapsed}s`;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}m ${secs}s`;
}

export const CommandPanel = memo(function CommandPanel({ className }: CommandPanelProps) {
  const currentCommand = useMonitorStore(selectCurrentCommand);
  const activeAgent = useMonitorStore(selectActiveAgent);
  const [elapsed, setElapsed] = useState('0s');

  // Update elapsed time every second when command is running
  useEffect(() => {
    if (!currentCommand || currentCommand.status !== 'running') {
      return;
    }

    const updateElapsed = () => {
      setElapsed(formatElapsedTime(currentCommand.startedAt));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [currentCommand]);

  const TerminalIcon = iconMap['terminal'];
  const LoaderIcon = iconMap['loader'];
  const CheckIcon = iconMap['check-circle'];
  const XIcon = iconMap['x-circle'];
  const UserIcon = iconMap['user'];

  // Get status icon and color
  const getStatusDisplay = () => {
    if (!currentCommand) return null;

    switch (currentCommand.status) {
      case 'running':
        return {
          icon: LoaderIcon,
          color: 'var(--accent-gold)',
          text: elapsed,
          animate: true,
        };
      case 'complete':
        return {
          icon: CheckIcon,
          color: 'var(--status-success)',
          text: 'Complete',
          animate: false,
        };
      case 'error':
        return {
          icon: XIcon,
          color: 'var(--status-error)',
          text: 'Error',
          animate: false,
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  // Don't render if no command and no agent
  if (!currentCommand && !activeAgent) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2',
        className
      )}
    >
      {/* Active Agent Badge */}
      {activeAgent && (
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center h-6 w-6 rounded"
            style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
          >
            <UserIcon className="h-3.5 w-3.5" style={{ color: 'rgb(147, 51, 234)' }} />
          </div>
          <div>
            <span
              className="text-[11px] font-medium"
              style={{ color: 'rgb(147, 51, 234)' }}
            >
              @{activeAgent.id}
            </span>
            {activeAgent.name && (
              <span
                className="text-[10px] ml-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {activeAgent.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Current Command */}
      {currentCommand && (
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
            <span
              className="text-[11px] font-mono"
              style={{ color: 'var(--text-secondary)' }}
            >
              {currentCommand.name}
            </span>
          </div>

          {/* Status */}
          {statusDisplay && (
            <div className="flex items-center gap-1.5">
              <statusDisplay.icon
                className={cn('h-3.5 w-3.5', statusDisplay.animate && 'animate-spin')}
                style={{ color: statusDisplay.color }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: statusDisplay.color }}
              >
                {statusDisplay.text}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Spacer when only agent is shown */}
      {activeAgent && !currentCommand && <div className="flex-1" />}
    </div>
  );
});
