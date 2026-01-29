import { cn } from '@/lib/utils';

export type StatusType =
  | 'pending'
  | 'in_progress'
  | 'needs_review'
  | 'complete'
  | 'error'
  | 'idle'
  | 'running'
  | 'waiting';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Task/Story statuses
  pending: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  in_progress: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
  needs_review: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  complete: 'bg-green-900/30 text-green-400 border-green-800/50',
  completed: 'bg-green-900/30 text-green-400 border-green-800/50',
  error: 'bg-red-900/30 text-red-400 border-red-800/50',

  // Terminal/Agent statuses
  idle: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  running: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  working: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  waiting: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  complete: 'Complete',
  completed: 'Completed',
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

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const colorClass = statusStyles[normalizedStatus] || statusStyles.pending;
  const label = statusLabels[normalizedStatus] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border uppercase tracking-wider font-bold',
        sizeStyles[size],
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}

// Indicator dot component for inline status
interface StatusDotProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const dotColorStyles: Record<string, string> = {
  pending: 'bg-zinc-500',
  in_progress: 'bg-blue-500',
  needs_review: 'bg-purple-500',
  complete: 'bg-green-500',
  completed: 'bg-green-500',
  error: 'bg-red-500',
  idle: 'bg-zinc-600',
  running: 'bg-yellow-500',
  working: 'bg-yellow-500',
  waiting: 'bg-orange-500',
};

const dotSizeStyles = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

export function StatusDot({ status, size = 'md', pulse = false, className }: StatusDotProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const colorClass = dotColorStyles[normalizedStatus] || dotColorStyles.pending;
  const shouldPulse = pulse || normalizedStatus === 'running' || normalizedStatus === 'working';

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        dotSizeStyles[size],
        colorClass,
        shouldPulse && 'animate-pulse',
        className
      )}
    />
  );
}
