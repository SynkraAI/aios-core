'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded-sm',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton variants for common use cases
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3 bg-[var(--card)] border border-[var(--border)]', className)}>
      <Skeleton height={12} width="60%" variant="text" />
      <Skeleton height={10} width="100%" variant="text" />
      <Skeleton height={10} width="80%" variant="text" />
      <div className="flex gap-2 pt-2">
        <Skeleton height={20} width={60} />
        <Skeleton height={20} width={40} />
      </div>
    </div>
  );
}

function SkeletonAvatar({ size = 32, className }: { size?: number; className?: string }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={10}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonText };
