import { cn } from '@/lib/utils';
import type { RoadmapImpact, RoadmapEffort, RoadmapPriority } from '@/types';

interface TagProps {
  label: string;
  variant?: 'default' | 'impact' | 'effort' | 'priority' | 'category';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  impact: {
    low: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    medium: 'bg-yellow-900/30 text-yellow-500 border-yellow-800/50',
    high: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  },
  effort: {
    low: 'bg-green-900/30 text-green-400 border-green-800/50',
    medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    high: 'bg-red-900/30 text-red-400 border-red-800/50',
  },
  priority: {
    must_have: 'bg-red-900/20 text-red-400 border-red-900/50',
    should_have: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50',
    could_have: 'bg-blue-900/20 text-blue-400 border-blue-900/50',
    wont_have: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  },
  category: {
    feature: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    fix: 'bg-red-900/30 text-red-400 border-red-800/50',
    refactor: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
    docs: 'bg-green-900/30 text-green-400 border-green-800/50',
  },
};

const sizeStyles = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-0.5',
};

export function Tag({ label, variant = 'default', size = 'md', className }: TagProps) {
  let colorClass = variantStyles.default;

  if (variant === 'impact') {
    const key = label.toLowerCase() as RoadmapImpact;
    colorClass = variantStyles.impact[key] || variantStyles.default;
  } else if (variant === 'effort') {
    const key = label.toLowerCase() as RoadmapEffort;
    colorClass = variantStyles.effort[key] || variantStyles.default;
  } else if (variant === 'priority') {
    const key = label.toLowerCase().replace(/['\s]/g, '_') as RoadmapPriority;
    colorClass = variantStyles.priority[key] || variantStyles.default;
  } else if (variant === 'category') {
    const key = label.toLowerCase() as keyof typeof variantStyles.category;
    colorClass = variantStyles.category[key] || variantStyles.default;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-mono uppercase tracking-wider font-medium',
        sizeStyles[size],
        colorClass,
        className
      )}
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
