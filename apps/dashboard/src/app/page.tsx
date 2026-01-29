'use client';

import { useUIStore } from '@/stores/ui-store';
import { SIDEBAR_ITEMS } from '@/types';

export default function Home() {
  const { activeView } = useUIStore();
  const currentItem = SIDEBAR_ITEMS.find((item) => item.id === activeView);

  return (
    <div className="flex h-full flex-col">
      {/* View Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
          <span className="text-3xl">{currentItem?.icon}</span>
          {currentItem?.label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getViewDescription(activeView)}
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-card/50">
        <div className="text-center">
          <span className="text-6xl">{currentItem?.icon}</span>
          <p className="mt-4 text-lg font-medium text-foreground">
            {currentItem?.label} View
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Content coming in Epic 1+
          </p>
        </div>
      </div>
    </div>
  );
}

function getViewDescription(view: string): string {
  const descriptions: Record<string, string> = {
    kanban: 'Story board with 7 columns for tracking development progress',
    terminals: 'Output from AIOS agents and command execution',
    roadmap: 'Timeline of epics and milestones',
    context: 'Context files and documentation',
    ideas: 'Backlog of ideas and feature requests',
    insights: 'Metrics, analytics and performance data',
    github: 'Issues, PRs and repository activity',
    worktrees: 'Git worktrees management',
    tools: 'Settings and configuration',
  };
  return descriptions[view] || '';
}
