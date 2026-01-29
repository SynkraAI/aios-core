'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'idle' | 'working' | 'waiting' | 'error' | 'success' | 'info';

interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<StatusType, string> = {
  idle: 'bg-[var(--status-idle)]',
  working: 'bg-[var(--status-success)]',
  waiting: 'bg-[var(--status-warning)]',
  error: 'bg-[var(--status-error)]',
  success: 'bg-[var(--status-success)]',
  info: 'bg-[var(--status-info)]',
};

const STATUS_GLOW: Record<StatusType, string> = {
  idle: '',
  working: 'shadow-[0_0_8px_var(--status-success-glow)]',
  waiting: 'shadow-[0_0_8px_var(--status-warning-glow)]',
  error: 'shadow-[0_0_8px_var(--status-error-glow)]',
  success: 'shadow-[0_0_8px_var(--status-success-glow)]',
  info: 'shadow-[0_0_8px_var(--status-info-glow)]',
};

const SIZE_CLASSES = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

export const StatusDot = memo(function StatusDot({
  status,
  size = 'md',
  glow = true,
  className,
}: StatusDotProps) {
  const isActive = status !== 'idle';

  return (
    <span
      className={cn(
        'rounded-full transition-all',
        SIZE_CLASSES[size],
        STATUS_COLORS[status],
        isActive && glow && STATUS_GLOW[status],
        className
      )}
    />
  );
});

export default StatusDot;
