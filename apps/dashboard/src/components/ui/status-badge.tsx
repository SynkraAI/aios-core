'use client';

import { cn } from '@/lib/utils';
import { StatusDot as StatusDotAtom, type StatusType as StatusDotType } from './status-dot';

export type StatusType =
  | 'pending'
  | 'in_progress'
  | 'needs_review'
  | 'complete'
  | 'completed'
  | 'error'
  | 'idle'
  | 'running'
  | 'working'
  | 'waiting'
  | 'backlog'
  | 'ai_review'
  | 'human_review'
  | 'pr_created'
  | 'done';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

// Using CSS variables for theming
const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  // Task/Story statuses
  pending: {
    bg: 'var(--status-idle-bg)',
    text: 'var(--status-idle)',
    border: 'var(--status-idle-border)',
  },
  backlog: {
    bg: 'var(--status-idle-bg)',
    text: 'var(--text-tertiary)',
    border: 'var(--border)',
  },
  in_progress: {
    bg: 'var(--status-info-bg)',
    text: 'var(--status-info)',
    border: 'var(--status-info-border)',
  },
  ai_review: {
    bg: 'var(--phase-review-bg)',
    text: 'var(--phase-review)',
    border: 'var(--phase-review-border)',
  },
  human_review: {
    bg: 'var(--status-warning-bg)',
    text: 'var(--status-warning)',
    border: 'var(--status-warning-border)',
  },
  needs_review: {
    bg: 'var(--phase-review-bg)',
    text: 'var(--phase-review)',
    border: 'var(--phase-review-border)',
  },
  pr_created: {
    bg: 'var(--phase-pr-bg)',
    text: 'var(--phase-pr)',
    border: 'var(--phase-pr-border)',
  },
  complete: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success)',
    border: 'var(--status-success-border)',
  },
  completed: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success)',
    border: 'var(--status-success-border)',
  },
  done: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success)',
    border: 'var(--status-success-border)',
  },
  error: {
    bg: 'var(--status-error-bg)',
    text: 'var(--status-error)',
    border: 'var(--status-error-border)',
  },
  // Agent/Terminal statuses
  idle: {
    bg: 'var(--status-idle-bg)',
    text: 'var(--status-idle)',
    border: 'var(--status-idle-border)',
  },
  running: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success)',
    border: 'var(--status-success-border)',
  },
  working: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success)',
    border: 'var(--status-success-border)',
  },
  waiting: {
    bg: 'var(--status-warning-bg)',
    text: 'var(--status-warning)',
    border: 'var(--status-warning-border)',
  },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  backlog: 'Backlog',
  in_progress: 'In Progress',
  ai_review: 'AI Review',
  human_review: 'Human Review',
  needs_review: 'Needs Review',
  pr_created: 'PR Created',
  complete: 'Complete',
  completed: 'Completed',
  done: 'Done',
  error: 'Error',
  idle: 'Idle',
  running: 'Running',
  working: 'Working',
  waiting: 'Waiting',
};

const sizeStyles = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-1',
};

// Map StatusType to StatusDotType
const statusToDotType: Record<string, StatusDotType> = {
  pending: 'idle',
  backlog: 'idle',
  idle: 'idle',
  in_progress: 'info',
  working: 'working',
  running: 'working',
  ai_review: 'info',
  human_review: 'waiting',
  needs_review: 'waiting',
  waiting: 'waiting',
  pr_created: 'info',
  complete: 'success',
  completed: 'success',
  done: 'success',
  error: 'error',
};

export function StatusBadge({ status, size = 'sm', showDot = false, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const style = statusStyles[normalizedStatus] || statusStyles.pending;
  const label = statusLabels[normalizedStatus] || status;
  const dotType = statusToDotType[normalizedStatus] || 'idle';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border uppercase tracking-wider font-medium',
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {showDot && <StatusDotAtom status={dotType} size="sm" />}
      {label}
    </span>
  );
}

// Re-export StatusDot from status-dot.tsx for backwards compatibility
export { StatusDotAtom as StatusDot, type StatusDotType as DotStatusType };
