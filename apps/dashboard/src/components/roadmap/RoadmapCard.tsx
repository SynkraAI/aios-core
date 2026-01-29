'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Tag, ImpactTag, EffortTag } from '@/components/ui/tag';
import type { RoadmapItem } from '@/types';

interface RoadmapCardProps {
  item: RoadmapItem;
  className?: string;
  onClick?: () => void;
}

export const RoadmapCard = memo(function RoadmapCard({
  item,
  className,
  onClick,
}: RoadmapCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#121214] border border-zinc-800 p-3 rounded-lg',
        'hover:border-zinc-600 transition-colors group cursor-pointer',
        item.priority === 'wont_have' && 'opacity-60 hover:opacity-100',
        className
      )}
    >
      {/* Title */}
      <h4 className="text-sm font-bold text-zinc-200 mb-2 leading-snug group-hover:text-white transition-colors">
        {item.title}
      </h4>

      {/* Description */}
      {item.description && (
        <p className="text-[11px] text-zinc-500 mb-3 line-clamp-2">{item.description}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <EffortTag effort={item.effort} />
        <ImpactTag impact={item.impact} />
      </div>

      {/* Category & custom tags */}
      {(item.category || (item.tags && item.tags.length > 0)) && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-zinc-800/50">
          {item.category && <Tag label={item.category} variant="category" size="sm" />}
          {item.tags?.slice(0, 2).map((tag) => (
            <Tag key={tag} label={tag} size="sm" />
          ))}
        </div>
      )}

      {/* Linked Story */}
      {item.linkedStoryId && (
        <div className="mt-2 pt-2 border-t border-zinc-800/50">
          <span className="text-[10px] text-zinc-600">
            Linked: <span className="text-zinc-400">{item.linkedStoryId}</span>
          </span>
        </div>
      )}
    </div>
  );
});
