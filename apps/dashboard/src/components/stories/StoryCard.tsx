'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { AGENT_CONFIG, type Story, type StoryComplexity, type AgentId } from '@/types';

// ============ Constants ============

const COMPLEXITY_STYLES: Record<StoryComplexity, string> = {
  simple: 'bg-green-500/10 text-green-400 border-green-500/20',
  standard: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  complex: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CATEGORY_STYLES: Record<string, string> = {
  feature: 'bg-blue-500/10 text-blue-400',
  fix: 'bg-orange-500/10 text-orange-400',
  refactor: 'bg-purple-500/10 text-purple-400',
  docs: 'bg-gray-500/10 text-gray-400',
};

// ============ Props ============

interface StoryCardProps {
  story: Story;
  isRunning?: boolean;
  isStuck?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============ Component ============

export const StoryCard = memo(function StoryCard({
  story,
  isRunning = false,
  isStuck = false,
  onClick,
  className,
}: StoryCardProps) {
  const {
    title,
    description,
    category,
    complexity,
    agentId,
    progress,
  } = story;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-lg border border-border bg-card p-3',
        'cursor-pointer transition-all duration-200',
        'hover:bg-card-hover hover:shadow-md hover:-translate-y-0.5',
        // Running state (AC10)
        isRunning && 'ring-2 ring-green-500',
        // Stuck state (AC11)
        isStuck && 'ring-2 ring-warning animate-pulse',
        className
      )}
    >
      {/* Header: Category & Complexity badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Category Badge */}
        {category && (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
              CATEGORY_STYLES[category] || 'bg-gray-500/10 text-gray-400'
            )}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        )}

        {/* Complexity Badge (AC5) */}
        {complexity && (
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
              COMPLEXITY_STYLES[complexity]
            )}
          >
            {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
          </span>
        )}
      </div>

      {/* Title (AC1, AC8) */}
      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
        {title}
      </h3>

      {/* Description (AC1) */}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {description}
        </p>
      )}

      {/* Footer: Agent & Progress */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {/* Agent Badge (AC3, AC9) */}
        {agentId && (
          <AgentBadge agentId={agentId} isActive={isRunning} />
        )}

        {/* Progress Bar (AC4) */}
        {typeof progress === 'number' && progress > 0 && (
          <div className="flex-1 max-w-[100px]">
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
});

// ============ Sub-components ============

interface AgentBadgeProps {
  agentId: AgentId;
  isActive?: boolean;
}

function AgentBadge({ agentId, isActive = false }: AgentBadgeProps) {
  const config = AGENT_CONFIG[agentId];
  if (!config) return null;

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${config.color}20` }}
    >
      <span>{config.icon}</span>
      <span style={{ color: config.color }}>@{agentId}</span>

      {/* Activity indicator (AC9) - animated dots when active */}
      {isActive && (
        <span className="flex gap-0.5 ml-1">
          <span
            className="h-1 w-1 rounded-full bg-green-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-1 w-1 rounded-full bg-green-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-1 w-1 rounded-full bg-green-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
}

function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-7 text-right">
        {clampedProgress}%
      </span>
    </div>
  );
}
