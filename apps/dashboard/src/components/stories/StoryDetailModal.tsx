'use client';

import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AGENT_CONFIG, KANBAN_COLUMNS, type Story } from '@/types';

// Status badge variants
const STATUS_VARIANTS: Record<string, string> = {
  backlog: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ai_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  human_review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  pr_created: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  done: 'bg-green-500/10 text-green-400 border-green-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const COMPLEXITY_VARIANTS: Record<string, string> = {
  simple: 'bg-green-500/10 text-green-400 border-green-500/20',
  standard: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  complex: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface StoryDetailModalProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryDetailModal({
  story,
  open,
  onOpenChange,
}: StoryDetailModalProps) {
  if (!story) return null;

  const statusConfig = KANBAN_COLUMNS.find((c) => c.id === story.status);
  const agentConfig = story.agentId ? AGENT_CONFIG[story.agentId] : null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pr-8">
            {story.id}: {story.title}
          </DialogTitle>
        </DialogHeader>

        {/* Badges Row (AC4) */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              'border',
              STATUS_VARIANTS[story.status] || STATUS_VARIANTS.backlog
            )}
          >
            {statusConfig?.icon} {statusConfig?.label || story.status}
          </Badge>

          {/* Agent Badge */}
          {agentConfig && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${agentConfig.color}20`,
                borderColor: `${agentConfig.color}40`,
                color: agentConfig.color,
              }}
            >
              {agentConfig.icon} @{story.agentId}
            </Badge>
          )}

          {/* Complexity Badge */}
          {story.complexity && (
            <Badge
              variant="outline"
              className={cn(
                'border',
                COMPLEXITY_VARIANTS[story.complexity]
              )}
            >
              {story.complexity.charAt(0).toUpperCase() + story.complexity.slice(1)}
            </Badge>
          )}

          {/* Priority Badge */}
          {story.priority && (
            <Badge variant="outline" className="border-muted">
              Priority: {story.priority}
            </Badge>
          )}
        </div>

        <div className="border-t border-border my-4" />

        {/* Description (AC2, AC3) */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Description
          </h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {story.description || 'No description provided.'}
          </p>
        </section>

        {/* Acceptance Criteria (AC2, AC3) */}
        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
          <section className="mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Acceptance Criteria
            </h3>
            <ul className="space-y-1.5">
              {story.acceptanceCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="text-muted-foreground">•</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Notes */}
        {story.technicalNotes && (
          <section className="mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Technical Notes
            </h3>
            <div className="bg-muted/50 rounded-md p-3 text-sm font-mono whitespace-pre-wrap">
              {story.technicalNotes}
            </div>
          </section>
        )}

        <div className="border-t border-border my-4" />

        {/* Timestamps (AC5) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Created: {formatDate(story.createdAt)}</span>
            <span>Updated: {formatDate(story.updatedAt)}</span>
          </div>

          {/* Open File Link (AC7) */}
          {story.filePath && (
            <button
              onClick={() => {
                // In a real implementation, this would open the file in the editor
                console.log('Open file:', story.filePath);
              }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded',
                'hover:bg-accent transition-colors',
                'text-muted-foreground hover:text-foreground'
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open File</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
