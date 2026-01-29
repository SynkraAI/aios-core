'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { ProgressBar } from '@/components/ui/progress-bar';
import { AGENT_CONFIG, type Story, type StoryComplexity, type AgentId } from '@/types';

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
        'group relative border p-3',
        'bg-[var(--card)] border-[var(--border)]',
        'cursor-pointer transition-luxury hover-lift',
        'hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)]',
        isRunning && 'border-[var(--status-success-border)] bg-[var(--status-success-bg)]',
        isStuck && 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]',
        className
      )}
    >
      {/* Header: Category & Complexity badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        {category && (
          <span
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              backgroundColor: `var(--category-${category}-bg, var(--border))`,
              color: `var(--category-${category}, var(--text-tertiary))`,
            }}
          >
            {category}
          </span>
        )}

        {complexity && (
          <span
            className="inline-flex items-center border px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `var(--complexity-${complexity}-bg)`,
              color: `var(--complexity-${complexity})`,
              borderColor: `var(--complexity-${complexity}-border)`,
            }}
          >
            {complexity}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-normal text-[var(--text-primary)] line-clamp-2 mb-1 leading-snug group-hover:text-white transition-colors">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 mb-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Footer: Agent & Progress */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {agentId && <AgentBadge agentId={agentId} isActive={isRunning} />}

        {typeof progress === 'number' && progress > 0 && (
          <div className="flex-1 max-w-[100px]">
            <ProgressBar progress={progress} showLabel size="sm" />
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
              className="h-1 w-1 rounded-full bg-[var(--status-success)] animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
