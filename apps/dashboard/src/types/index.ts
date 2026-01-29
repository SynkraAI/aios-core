// AIOS Dashboard Types - PRD v1.4

// ============ Story Types ============

export type StoryStatus =
  | 'backlog'
  | 'in_progress'
  | 'ai_review'
  | 'human_review'
  | 'pr_created'
  | 'done'
  | 'error';

export type StoryComplexity = 'simple' | 'standard' | 'complex';
export type StoryPriority = 'low' | 'medium' | 'high' | 'critical';
export type StoryCategory = 'feature' | 'fix' | 'refactor' | 'docs';

export interface Story {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;

  // Classification
  epicId?: string;
  complexity?: StoryComplexity;
  priority?: StoryPriority;
  category?: StoryCategory;

  // Agent association
  agentId?: AgentId;
  progress?: number;

  // Content
  acceptanceCriteria?: string[];
  technicalNotes?: string;

  // Metadata
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Agent Types ============

export type AgentId =
  | 'dev'
  | 'qa'
  | 'architect'
  | 'pm'
  | 'po'
  | 'analyst'
  | 'devops';

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error';

export interface Agent {
  id: AgentId;
  name: string;
  icon: string;
  color: string;
  status: AgentStatus;
  currentStoryId?: string;
}

// ============ Project Types ============

export interface Project {
  id: string;
  name: string;
  path: string;
}

// ============ Status Types ============

export interface AiosStatus {
  version: string;
  updatedAt: string;
  connected: boolean;
  project: {
    name: string;
    path: string;
  } | null;
  activeAgent: {
    id: AgentId;
    name: string;
    activatedAt: string;
    currentStory?: string;
  } | null;
  session: {
    startedAt: string;
    commandsExecuted: number;
    lastCommand?: string;
  } | null;
  stories: {
    inProgress: string[];
    completed: string[];
  };
  // Rate limit info (optional - provided by CLI when available)
  rateLimit?: {
    used: number;
    limit: number;
    resetsAt?: string;
  };
}

// ============ Sidebar Types ============

export type SidebarView =
  | 'kanban'
  | 'terminals'
  | 'roadmap'
  | 'context'
  | 'ideas'
  | 'insights'
  | 'github'
  | 'worktrees'
  | 'tools';

export interface SidebarItem {
  id: SidebarView;
  label: string;
  icon: string;
  href: string;
}

// ============ Kanban Column Types ============

export interface KanbanColumn {
  id: StoryStatus;
  label: string;
  icon: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog', icon: '📋', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', icon: '🚀', color: 'blue' },
  { id: 'ai_review', label: 'AI Review', icon: '🤖', color: 'purple' },
  { id: 'human_review', label: 'Human Review', icon: '👤', color: 'yellow' },
  { id: 'pr_created', label: 'PR Created', icon: '🔗', color: 'cyan' },
  { id: 'done', label: 'Done', icon: '✅', color: 'green' },
  { id: 'error', label: 'Error', icon: '❌', color: 'red' },
];

// ============ Agent Config ============

export const AGENT_CONFIG: Record<AgentId, { name: string; icon: string; color: string }> = {
  dev: { name: 'Dev', icon: '💻', color: 'var(--agent-dev)' },
  qa: { name: 'QA', icon: '🧪', color: 'var(--agent-qa)' },
  architect: { name: 'Architect', icon: '🏛️', color: 'var(--agent-architect)' },
  pm: { name: 'PM', icon: '📊', color: 'var(--agent-pm)' },
  po: { name: 'PO', icon: '🎯', color: 'var(--agent-po)' },
  analyst: { name: 'Analyst', icon: '📈', color: 'var(--agent-analyst)' },
  devops: { name: 'DevOps', icon: '🔧', color: 'var(--agent-devops)' },
};

// ============ Sidebar Config ============

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'kanban', label: 'Kanban', icon: '📋', href: '/kanban' },
  { id: 'terminals', label: 'Terminals', icon: '💻', href: '/terminals' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️', href: '/roadmap' },
  { id: 'context', label: 'Context', icon: '📚', href: '/context' },
  { id: 'ideas', label: 'Ideas', icon: '💡', href: '/ideas' },
  { id: 'insights', label: 'Insights', icon: '📊', href: '/insights' },
  { id: 'github', label: 'GitHub', icon: '🔗', href: '/github' },
  { id: 'worktrees', label: 'Worktrees', icon: '🌳', href: '/worktrees' },
  { id: 'tools', label: 'Tools', icon: '🔧', href: '/tools' },
];
