'use client';

import { cn } from '@/lib/utils';
import type { RoadmapImpact, RoadmapEffort, RoadmapPriority } from '@/types';

interface TagProps {
  label: string;
  variant?: 'default' | 'impact' | 'effort' | 'priority' | 'category';
  size?: 'sm' | 'md';
  className?: string;
}

// Using CSS variables for theming
const variantStyles = {
  default: {
    bg: 'var(--border)',
    text: 'var(--text-tertiary)',
    border: 'var(--border)',
  },
  impact: {
    low: {
      bg: 'var(--status-idle-bg)',
      text: 'var(--text-tertiary)',
      border: 'var(--border)',
    },
    medium: {
      bg: 'var(--status-warning-bg)',
      text: 'var(--status-warning)',
      border: 'var(--status-warning-border)',
    },
    high: {
      bg: 'var(--phase-review-bg)',
      text: 'var(--phase-review)',
      border: 'var(--phase-review-border)',
    },
  },
  effort: {
    low: {
      bg: 'var(--status-success-bg)',
      text: 'var(--status-success)',
      border: 'var(--status-success-border)',
    },
    medium: {
      bg: 'var(--status-warning-bg)',
      text: 'var(--status-warning)',
      border: 'var(--status-warning-border)',
    },
    high: {
      bg: 'var(--status-error-bg)',
      text: 'var(--status-error)',
      border: 'var(--status-error-border)',
    },
  },
  priority: {
    must_have: {
      bg: 'var(--priority-must-bg)',
      text: 'var(--priority-must)',
      border: 'var(--priority-must-border)',
    },
    should_have: {
      bg: 'var(--priority-should-bg)',
      text: 'var(--priority-should)',
      border: 'var(--priority-should-border)',
    },
    could_have: {
      bg: 'var(--priority-could-bg)',
      text: 'var(--priority-could)',
      border: 'var(--priority-could-border)',
    },
    wont_have: {
      bg: 'var(--priority-wont-bg)',
      text: 'var(--priority-wont)',
      border: 'var(--priority-wont-border)',
    },
  },
  category: {
    feature: {
      bg: 'var(--category-feature-bg)',
      text: 'var(--category-feature)',
      border: 'transparent',
    },
    fix: {
      bg: 'var(--category-fix-bg)',
      text: 'var(--category-fix)',
      border: 'transparent',
    },
    refactor: {
      bg: 'var(--category-refactor-bg)',
      text: 'var(--category-refactor)',
      border: 'transparent',
    },
    docs: {
      bg: 'var(--category-docs-bg)',
      text: 'var(--category-docs)',
      border: 'transparent',
    },
  },
};

const sizeStyles = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-0.5',
};

export function Tag({ label, variant = 'default', size = 'md', className }: TagProps) {
  let style = variantStyles.default;

  if (variant === 'impact') {
    const key = label.toLowerCase() as RoadmapImpact;
    style = variantStyles.impact[key] || variantStyles.default;
  } else if (variant === 'effort') {
    const key = label.toLowerCase() as RoadmapEffort;
    style = variantStyles.effort[key] || variantStyles.default;
  } else if (variant === 'priority') {
    const key = label.toLowerCase().replace(/['\s]/g, '_') as RoadmapPriority;
    style = variantStyles.priority[key] || variantStyles.default;
  } else if (variant === 'category') {
    const key = label.toLowerCase() as keyof typeof variantStyles.category;
    style = variantStyles.category[key] || variantStyles.default;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono uppercase tracking-wider font-medium',
        sizeStyles[size],
        style.border !== 'transparent' && 'border',
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      {label}
    </span>
  );
}

// Convenience components for specific tag types
export function ImpactTag({ impact, className }: { impact: RoadmapImpact; className?: string }) {
  const labels: Record<RoadmapImpact, string> = {
    low: 'low impact',
    medium: 'medium impact',
    high: 'high impact',
  };
  return <Tag label={labels[impact]} variant="impact" className={className} />;
}

export function EffortTag({ effort, className }: { effort: RoadmapEffort; className?: string }) {
  return <Tag label={effort} variant="effort" className={className} />;
}

export function PriorityTag({ priority, className }: { priority: RoadmapPriority; className?: string }) {
  const labels: Record<RoadmapPriority, string> = {
    must_have: 'Must Have',
    should_have: 'Should Have',
    could_have: 'Could Have',
    wont_have: "Won't Have",
  };
  return <Tag label={labels[priority]} variant="priority" className={className} />;
}
