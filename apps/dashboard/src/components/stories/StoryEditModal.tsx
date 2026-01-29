'use client';

import { useState, useCallback, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
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

interface StoryEditModalProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (story: Story) => void;
  onDeleted?: (storyId: string) => void;
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
  progress: string;
}

const STATUS_OPTIONS: { value: StoryStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ai_review', label: 'AI Review' },
  { value: 'human_review', label: 'Human Review' },
  { value: 'pr_created', label: 'PR Created' },
  { value: 'done', label: 'Done' },
  { value: 'error', label: 'Error' },
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

function storyToFormData(story: Story): FormData {
  return {
    title: story.title,
    description: story.description || '',
    status: story.status,
    priority: story.priority || '',
    complexity: story.complexity || '',
    category: story.category || '',
    agent: story.agentId || '',
    epicId: story.epicId || '',
    acceptanceCriteria: story.acceptanceCriteria?.join('\n') || '',
    technicalNotes: story.technicalNotes || '',
    progress: story.progress !== undefined ? String(story.progress) : '',
  };
}

export function StoryEditModal({
  story,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: StoryEditModalProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when story changes
  useEffect(() => {
    if (story && open) {
      setFormData(storyToFormData(story));
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [story, open]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !formData) return;

    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          status: formData.status,
          priority: formData.priority || null,
          complexity: formData.complexity || null,
          category: formData.category || null,
          agent: formData.agent || null,
          epicId: formData.epicId.trim() || undefined,
          acceptanceCriteria: formData.acceptanceCriteria
            ? formData.acceptanceCriteria.split('\n').filter(Boolean).map((s) => s.trim())
            : [],
          technicalNotes: formData.technicalNotes.trim() || undefined,
          progress: formData.progress ? parseInt(formData.progress, 10) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update story');
      }

      const data = await response.json();
      onUpdated?.(data.story);
      onOpenChange(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update story');
    } finally {
      setIsSubmitting(false);
    }
  }, [story, formData, onUpdated, onOpenChange]);

  const handleDelete = useCallback(async () => {
    if (!story) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete story');
      }

      onDeleted?.(story.id);
      onOpenChange(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [story, onDeleted, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!isSubmitting && !isDeleting) {
      setFormData(null);
      setError(null);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  }, [isSubmitting, isDeleting, onOpenChange]);

  if (!story || !formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Story</DialogTitle>
          <DialogDescription>
            Update story details. Changes will be saved to the markdown file.
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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
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
                disabled={isSubmitting || isDeleting}
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
                disabled={isSubmitting || isDeleting}
              >
                <option value="">None</option>
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
                disabled={isSubmitting || isDeleting}
              >
                <option value="">None</option>
                {COMPLEXITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Category, Agent, Progress */}
          <div className="grid grid-cols-3 gap-3">
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
                disabled={isSubmitting || isDeleting}
              >
                <option value="">None</option>
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
                disabled={isSubmitting || isDeleting}
              >
                <option value="">None</option>
                {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                  <option key={id} value={id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="progress" className="text-sm font-medium">
                Progress %
              </label>
              <input
                id="progress"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
                placeholder="0-100"
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                disabled={isSubmitting || isDeleting}
              />
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
              disabled={isSubmitting || isDeleting}
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
              disabled={isSubmitting || isDeleting}
            />
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
              disabled={isSubmitting || isDeleting}
            />
          </div>

          {/* File path info */}
          <div className="text-xs text-muted-foreground">
            File: <code className="bg-muted px-1 rounded">{story.filePath}</code>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500 mb-3">
                Are you sure you want to delete this story? It will be moved to archive.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1">
              {!showDeleteConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting || isDeleting}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
