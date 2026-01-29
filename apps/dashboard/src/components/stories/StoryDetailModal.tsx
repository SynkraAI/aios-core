'use client';

import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { AGENT_CONFIG, KANBAN_COLUMNS, type Story } from '@/types';

// Status badge variants - using CSS variables
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  backlog: { bg: 'var(--status-idle-bg)', text: 'var(--text-tertiary)', border: 'var(--border)' },
  in_progress: { bg: 'var(--status-info-bg)', text: 'var(--status-info)', border: 'var(--status-info-border)' },
  ai_review: { bg: 'var(--phase-review-bg)', text: 'var(--phase-review)', border: 'var(--phase-review-border)' },
  human_review: { bg: 'var(--status-warning-bg)', text: 'var(--status-warning)', border: 'var(--status-warning-border)' },
  pr_created: { bg: 'var(--phase-pr-bg)', text: 'var(--phase-pr)', border: 'var(--phase-pr-border)' },
  done: { bg: 'var(--status-success-bg)', text: 'var(--status-success)', border: 'var(--status-success-border)' },
  error: { bg: 'var(--status-error-bg)', text: 'var(--status-error)', border: 'var(--status-error-border)' },
};

const COMPLEXITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  simple: { bg: 'var(--complexity-simple-bg)', text: 'var(--complexity-simple)', border: 'var(--complexity-simple-border)' },
  standard: { bg: 'var(--complexity-standard-bg)', text: 'var(--complexity-standard)', border: 'var(--complexity-standard-border)' },
  complex: { bg: 'var(--complexity-complex-bg)', text: 'var(--complexity-complex)', border: 'var(--complexity-complex-border)' },
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <DialogHeader>
          <div className="mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent-gold)' }}>{story.id}</span>
          </div>
          <DialogTitle className="text-base font-light pr-8" style={{ color: 'var(--text-primary)' }}>
            {story.title}
          </DialogTitle>
        </DialogHeader>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Status Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider border"
            style={{
              backgroundColor: (STATUS_STYLES[story.status] || STATUS_STYLES.backlog).bg,
              color: (STATUS_STYLES[story.status] || STATUS_STYLES.backlog).text,
              borderColor: (STATUS_STYLES[story.status] || STATUS_STYLES.backlog).border,
            }}
          >
            {statusConfig && (() => {
              const IconComponent = iconMap[statusConfig.icon];
              return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
            })()}
            {statusConfig?.label || story.status}
          </span>

          {/* Agent Badge */}
          {agentConfig && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium border"
              style={{
                backgroundColor: `${agentConfig.color}15`,
                borderColor: `${agentConfig.color}30`,
                color: agentConfig.color,
              }}
            >
              {(() => {
                const IconComponent = iconMap[agentConfig.icon];
                return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
              })()}
              @{story.agentId}
            </span>
          )}

          {/* Complexity Badge */}
          {story.complexity && (
            <span
              className="inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-wider border"
              style={{
                backgroundColor: COMPLEXITY_STYLES[story.complexity]?.bg,
                color: COMPLEXITY_STYLES[story.complexity]?.text,
                borderColor: COMPLEXITY_STYLES[story.complexity]?.border,
              }}
            >
              {story.complexity}
            </span>
          )}

          {/* Priority Badge */}
          {story.priority && (
            <span
              className="inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-wider border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              P{story.priority}
            </span>
          )}
        </div>

        <div className="border-t my-4" style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Description */}
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-gold)' }}>
            Description
          </h3>
          <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {story.description || 'No description provided.'}
          </p>
        </section>

        {/* Acceptance Criteria */}
        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
          <section className="mt-5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-gold)' }}>
              Acceptance Criteria
            </h3>
            <ul className="space-y-2">
              {story.acceptanceCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[13px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="mt-0.5" style={{ color: 'var(--border)' }}>•</span>
                  <span className="leading-relaxed">{criterion}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Notes */}
        {story.technicalNotes && (
          <section className="mt-5">
            <h3 className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-gold)' }}>
              Technical Notes
            </h3>
            <div
              className="border p-3 text-[11px] font-mono whitespace-pre-wrap"
              style={{
                backgroundColor: 'var(--bg-hover)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-tertiary)',
              }}
            >
              {story.technicalNotes}
            </div>
          </section>
        )}

        <div className="border-t my-4" style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
            <span>Created: <span style={{ color: 'var(--text-tertiary)' }}>{formatDate(story.createdAt)}</span></span>
            <span>Updated: <span style={{ color: 'var(--text-tertiary)' }}>{formatDate(story.updatedAt)}</span></span>
          </div>

          {/* Open File Link */}
          {story.filePath && (
            <button
              onClick={() => {
                console.log('Open file:', story.filePath);
              }}
              className="flex items-center gap-1.5 px-2 py-1 transition-luxury hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-gold)';
                e.currentTarget.style.backgroundColor = 'var(--accent-gold-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ExternalLink className="h-3 w-3" />
              <span>Open File</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
