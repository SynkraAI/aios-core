'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { AGENT_CONFIG, type Story, type StoryComplexity, type AgentId } from '@/types';

// ============ Constants ============

const COMPLEXITY_STYLES: Record<StoryComplexity, string> = {
  simple: 'bg-[rgba(74,222,128,0.08)] text-[#4ADE80] border-[rgba(74,222,128,0.15)]',
  standard: 'bg-[rgba(251,191,36,0.08)] text-[#FBBF24] border-[rgba(251,191,36,0.15)]',
  complex: 'bg-[rgba(248,113,113,0.08)] text-[#F87171] border-[rgba(248,113,113,0.15)]',
};

const CATEGORY_STYLES: Record<string, string> = {
  feature: 'bg-[rgba(96,165,250,0.08)] text-[#60A5FA]',
  fix: 'bg-[rgba(251,146,60,0.08)] text-[#FB923C]',
  refactor: 'bg-[rgba(167,139,250,0.08)] text-[#A78BFA]',
  docs: 'bg-[rgba(255,255,255,0.04)] text-[#6B6B5F]',
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
  const { title, description, category, complexity, agentId, progress } = story;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-3',
        'cursor-pointer transition-all duration-200',
        'hover:border-border/80 hover:bg-accent/5',
        isRunning && 'ring-2 ring-green-500/50 border-green-500/30',
        isStuck && 'ring-2 ring-yellow-500/50 border-yellow-500/30',
        className
      )}
    >
      {/* Header: Category & Complexity badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {category && (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
              CATEGORY_STYLES[category] || 'bg-muted text-muted-foreground'
            )}
          >
            {category}
          </span>
        )}

        {complexity && (
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
              COMPLEXITY_STYLES[complexity]
            )}
          >
            {complexity}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {description}
        </p>
      )}

      {/* Footer: Agent & Progress */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {agentId && <AgentBadge agentId={agentId} isActive={isRunning} />}

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

  const IconComponent = iconMap[config.icon];

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${config.color}15` }}
    >
      {IconComponent && (
        <IconComponent
          className="h-3 w-3"
          style={{ color: config.color }}
        />
      )}
      <span style={{ color: config.color }}>@{agentId}</span>

      {/* Activity indicator - animated dots when active */}
      {isActive && (
        <span className="flex gap-0.5 ml-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1 w-1 rounded-full bg-green-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
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
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {clampedProgress}%
      </span>
    </div>
  );
}
