'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AGENT_CONFIG,
  type AgentId,
  type StoryStatus,
  type StoryPriority,
  type StoryComplexity,
  type StoryCategory,
  type Story,
} from '@/types';

interface StoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (story: Story) => void;
  defaultStatus?: StoryStatus;
}

interface FormData {
  title: string;
  description: string;
  status: StoryStatus;
  priority: StoryPriority | '';
  complexity: StoryComplexity | '';
  category: StoryCategory | '';
  agent: AgentId | '';
  epicId: string;
  acceptanceCriteria: string;
  technicalNotes: string;
}

const INITIAL_FORM_DATA: FormData = {
  title: '',
  description: '',
  status: 'backlog',
  priority: '',
  complexity: '',
  category: '',
  agent: '',
  epicId: '',
  acceptanceCriteria: '',
  technicalNotes: '',
};

const STATUS_OPTIONS: { value: StoryStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ai_review', label: 'AI Review' },
  { value: 'human_review', label: 'Human Review' },
  { value: 'pr_created', label: 'PR Created' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: StoryPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const COMPLEXITY_OPTIONS: { value: StoryComplexity; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'complex', label: 'Complex' },
];

const CATEGORY_OPTIONS: { value: StoryCategory; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'fix', label: 'Fix' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'docs', label: 'Docs' },
];

export function StoryCreateModal({
  open,
  onOpenChange,
  onCreated,
  defaultStatus = 'backlog',
}: StoryCreateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    ...INITIAL_FORM_DATA,
    status: defaultStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          priority: formData.priority || undefined,
          complexity: formData.complexity || undefined,
          category: formData.category || undefined,
          agent: formData.agent || undefined,
          epicId: formData.epicId.trim() || undefined,
          acceptanceCriteria: formData.acceptanceCriteria
            ? formData.acceptanceCriteria.split('\n').filter(Boolean).map((s) => s.trim())
            : undefined,
          technicalNotes: formData.technicalNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create story');
      }

      const data = await response.json();

      // Reset form
      setFormData({ ...INITIAL_FORM_DATA, status: defaultStatus });

      // Notify parent
      onCreated?.(data.story);
      onOpenChange(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, defaultStatus, onCreated, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFormData({ ...INITIAL_FORM_DATA, status: defaultStatus });
      setError(null);
      onOpenChange(false);
    }
  }, [isSubmitting, defaultStatus, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Story</DialogTitle>
          <DialogDescription>
            Add a new story to the backlog. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter story title"
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the story"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-background resize-none',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              disabled={isSubmitting}
            />
          </div>

          {/* Row: Status, Priority, Complexity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting}
              >
                <option value="">Select...</option>
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="complexity" className="text-sm font-medium">
                Complexity
              </label>
              <select
                id="complexity"
                name="complexity"
                value={formData.complexity}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting}
              >
                <option value="">Select...</option>
                {COMPLEXITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Category, Agent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting}
              >
                <option value="">Select...</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="agent" className="text-sm font-medium">
                Assign Agent
              </label>
              <select
                id="agent"
                name="agent"
                value={formData.agent}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting}
              >
                <option value="">Select...</option>
                {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                  <option key={id} value={id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Epic ID */}
          <div className="space-y-1.5">
            <label htmlFor="epicId" className="text-sm font-medium">
              Epic ID
            </label>
            <input
              id="epicId"
              name="epicId"
              type="text"
              value={formData.epicId}
              onChange={handleChange}
              placeholder="e.g., EPIC-123"
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              disabled={isSubmitting}
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="space-y-1.5">
            <label htmlFor="acceptanceCriteria" className="text-sm font-medium">
              Acceptance Criteria
            </label>
            <textarea
              id="acceptanceCriteria"
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={handleChange}
              placeholder="One criterion per line"
              rows={4}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-background resize-none font-mono text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter each acceptance criterion on a new line
            </p>
          </div>

          {/* Technical Notes */}
          <div className="space-y-1.5">
            <label htmlFor="technicalNotes" className="text-sm font-medium">
              Technical Notes
            </label>
            <textarea
              id="technicalNotes"
              name="technicalNotes"
              value={formData.technicalNotes}
              onChange={handleChange}
              placeholder="Implementation details, considerations, etc."
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-background resize-none',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              disabled={isSubmitting}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Story'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
