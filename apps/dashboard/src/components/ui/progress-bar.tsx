'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  glow?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-0.5',
  md: 'h-1',
};

export const ProgressBar = memo(function ProgressBar({
  progress,
  color = 'var(--accent-gold)',
  showLabel = false,
  size = 'md',
  glow = false,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 bg-[var(--border)] overflow-hidden',
          SIZE_CLASSES[size]
        )}
      >
        <div
          className="h-full transition-luxury"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
            boxShadow: glow ? `0 0 8px ${color}40` : undefined,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums font-light min-w-[2.5rem] text-right">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
});

export default ProgressBar;
