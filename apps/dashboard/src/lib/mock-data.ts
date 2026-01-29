/**
 * Mock Data for AIOS Dashboard
 * Used for development and demo purposes
 */

import type { Story, Agent, AgentId, RoadmapItem, TerminalSession } from '@/types';

// ============ Mock Stories ============

export const MOCK_STORIES: Story[] = [
  // Backlog
  {
    id: 'story-001',
    title: 'Implement user authentication flow',
    description: 'Add OAuth2 login with Google and GitHub providers',
    status: 'backlog',
    category: 'feature',
    complexity: 'complex',
    priority: 'high',
    filePath: 'docs/stories/story-001.md',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
    acceptanceCriteria: [
      'Users can login with Google',
      'Users can login with GitHub',
      'Session persists across page refreshes',
    ],
  },
  {
    id: 'story-002',
    title: 'Add dark mode support',
    description: 'Implement system-aware dark mode with manual toggle',
    status: 'backlog',
    category: 'feature',
    complexity: 'simple',
    priority: 'medium',
    filePath: 'docs/stories/story-002.md',
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-01-25T11:00:00Z',
  },
  {
    id: 'story-003',
    title: 'Fix memory leak in WebSocket connection',
    description: 'Connection not properly closing on component unmount',
    status: 'backlog',
    category: 'fix',
    complexity: 'standard',
    priority: 'high',
    filePath: 'docs/stories/story-003.md',
    createdAt: '2026-01-26T09:00:00Z',
    updatedAt: '2026-01-26T09:00:00Z',
  },

  // In Progress
  {
    id: 'story-004',
    title: 'Implement real-time notifications',
    description: 'Push notifications for agent status changes and story updates',
    status: 'in_progress',
    category: 'feature',
    complexity: 'standard',
    priority: 'high',
    agentId: 'dev',
    progress: 65,
    filePath: 'docs/stories/story-004.md',
    createdAt: '2026-01-24T14:00:00Z',
    updatedAt: '2026-01-29T02:30:00Z',
  },
  {
    id: 'story-005',
    title: 'Refactor API routes to use tRPC',
    description: 'Migrate REST endpoints to type-safe tRPC procedures',
    status: 'in_progress',
    category: 'refactor',
    complexity: 'complex',
    priority: 'medium',
    agentId: 'architect',
    progress: 30,
    filePath: 'docs/stories/story-005.md',
    createdAt: '2026-01-27T08:00:00Z',
    updatedAt: '2026-01-29T01:00:00Z',
  },

  // AI Review
  {
    id: 'story-006',
    title: 'Add unit tests for story-store',
    description: 'Comprehensive test coverage for Zustand store actions',
    status: 'ai_review',
    category: 'feature',
    complexity: 'simple',
    priority: 'medium',
    agentId: 'qa',
    progress: 90,
    filePath: 'docs/stories/story-006.md',
    createdAt: '2026-01-26T16:00:00Z',
    updatedAt: '2026-01-29T02:00:00Z',
  },

  // Human Review
  {
    id: 'story-007',
    title: 'Update README with new setup instructions',
    description: 'Document new environment variables and Docker setup',
    status: 'human_review',
    category: 'docs',
    complexity: 'simple',
    priority: 'low',
    agentId: 'pm',
    progress: 100,
    filePath: 'docs/stories/story-007.md',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
  },
  {
    id: 'story-008',
    title: 'Implement drag-and-drop for Kanban cards',
    description: 'Allow users to move stories between columns',
    status: 'human_review',
    category: 'feature',
    complexity: 'standard',
    priority: 'high',
    agentId: 'dev',
    progress: 100,
    filePath: 'docs/stories/story-008.md',
    createdAt: '2026-01-27T12:00:00Z',
    updatedAt: '2026-01-28T22:00:00Z',
  },

  // PR Created
  {
    id: 'story-009',
    title: 'Add keyboard shortcuts for navigation',
    description: 'Vim-style navigation with j/k and quick actions',
    status: 'pr_created',
    category: 'feature',
    complexity: 'simple',
    priority: 'low',
    agentId: 'dev',
    progress: 100,
    filePath: 'docs/stories/story-009.md',
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-01-28T18:00:00Z',
  },

  // Done
  {
    id: 'story-010',
    title: 'Setup project structure',
    description: 'Initialize Next.js app with TypeScript and Tailwind',
    status: 'done',
    category: 'feature',
    complexity: 'simple',
    priority: 'critical',
    filePath: 'docs/stories/story-010.md',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'story-011',
    title: 'Create base UI components',
    description: 'Button, Card, Badge, Dialog using shadcn/ui',
    status: 'done',
    category: 'feature',
    complexity: 'standard',
    priority: 'high',
    filePath: 'docs/stories/story-011.md',
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
  {
    id: 'story-012',
    title: 'Implement sidebar navigation',
    description: 'Collapsible sidebar with icon-based navigation',
    status: 'done',
    category: 'feature',
    complexity: 'simple',
    priority: 'high',
    filePath: 'docs/stories/story-012.md',
    createdAt: '2026-01-22T08:00:00Z',
    updatedAt: '2026-01-23T12:00:00Z',
  },

  // Error
  {
    id: 'story-013',
    title: 'Integrate with external payment API',
    description: 'Stripe integration for subscription billing',
    status: 'error',
    category: 'feature',
    complexity: 'complex',
    priority: 'high',
    agentId: 'dev',
    progress: 45,
    filePath: 'docs/stories/story-013.md',
    createdAt: '2026-01-26T14:00:00Z',
    updatedAt: '2026-01-28T20:00:00Z',
    technicalNotes: 'Error: API key validation failed. Need to verify credentials.',
  },
];

// ============ Mock Agents ============

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'dev',
    name: 'Dev',
    icon: 'code',
    color: 'var(--agent-dev)',
    status: 'working',
    currentStoryId: 'story-004',
    phase: 'coding',
    progress: 65,
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  },
  {
    id: 'qa',
    name: 'QA',
    icon: 'test-tube',
    color: 'var(--agent-qa)',
    status: 'working',
    currentStoryId: 'story-006',
    phase: 'testing',
    progress: 90,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  {
    id: 'architect',
    name: 'Architect',
    icon: 'building',
    color: 'var(--agent-architect)',
    status: 'working',
    currentStoryId: 'story-005',
    phase: 'planning',
    progress: 30,
    lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
  },
  {
    id: 'pm',
    name: 'PM',
    icon: 'bar-chart',
    color: 'var(--agent-pm)',
    status: 'waiting',
    currentStoryId: 'story-007',
    phase: 'reviewing',
    progress: 100,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago (stale)
  },
  {
    id: 'po',
    name: 'PO',
    icon: 'target',
    color: 'var(--agent-po)',
    status: 'idle',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    icon: 'line-chart',
    color: 'var(--agent-analyst)',
    status: 'idle',
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'wrench',
    color: 'var(--agent-devops)',
    status: 'error',
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// ============ Mock GitHub Data ============

export interface MockPullRequest {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  reviewStatus: 'pending' | 'approved' | 'changes_requested';
  storyId?: string;
}

export interface MockIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  createdAt: string;
  labels: string[];
  assignee?: string;
}

export const MOCK_PULL_REQUESTS: MockPullRequest[] = [
  {
    id: 1,
    number: 42,
    title: 'feat: add keyboard shortcuts for navigation',
    state: 'open',
    author: 'aios-dev',
    createdAt: '2026-01-28T18:00:00Z',
    updatedAt: '2026-01-29T01:00:00Z',
    labels: ['feature', 'ready-for-review'],
    reviewStatus: 'pending',
    storyId: 'story-009',
  },
  {
    id: 2,
    number: 41,
    title: 'feat: implement drag-and-drop for Kanban cards',
    state: 'open',
    author: 'aios-dev',
    createdAt: '2026-01-28T22:00:00Z',
    updatedAt: '2026-01-29T00:30:00Z',
    labels: ['feature', 'needs-review'],
    reviewStatus: 'approved',
    storyId: 'story-008',
  },
  {
    id: 3,
    number: 40,
    title: 'docs: update README with new setup instructions',
    state: 'open',
    author: 'aios-pm',
    createdAt: '2026-01-29T00:00:00Z',
    updatedAt: '2026-01-29T00:00:00Z',
    labels: ['documentation'],
    reviewStatus: 'pending',
    storyId: 'story-007',
  },
  {
    id: 4,
    number: 39,
    title: 'fix: resolve memory leak in WebSocket handler',
    state: 'merged',
    author: 'aios-dev',
    createdAt: '2026-01-27T14:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
    labels: ['bug', 'priority-high'],
    reviewStatus: 'approved',
  },
  {
    id: 5,
    number: 38,
    title: 'refactor: migrate auth to NextAuth v5',
    state: 'closed',
    author: 'aios-architect',
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-01-26T16:00:00Z',
    labels: ['refactor'],
    reviewStatus: 'changes_requested',
  },
];

export const MOCK_ISSUES: MockIssue[] = [
  {
    id: 101,
    number: 15,
    title: 'Performance degradation on large datasets',
    state: 'open',
    author: 'user123',
    createdAt: '2026-01-28T14:00:00Z',
    labels: ['bug', 'performance', 'priority-high'],
    assignee: 'aios-dev',
  },
  {
    id: 102,
    number: 14,
    title: 'Add export to CSV functionality',
    state: 'open',
    author: 'user456',
    createdAt: '2026-01-27T10:00:00Z',
    labels: ['enhancement', 'good-first-issue'],
  },
  {
    id: 103,
    number: 13,
    title: 'Mobile responsive layout issues',
    state: 'open',
    author: 'user789',
    createdAt: '2026-01-26T08:00:00Z',
    labels: ['bug', 'ui'],
    assignee: 'aios-dev',
  },
  {
    id: 104,
    number: 12,
    title: 'Documentation for API endpoints',
    state: 'closed',
    author: 'contributor1',
    createdAt: '2026-01-24T12:00:00Z',
    labels: ['documentation'],
  },
];

// ============ Mock Terminal Output ============

export const MOCK_TERMINAL_OUTPUT = `
[2026-01-29 02:45:12] @dev Starting work on story-004...
[2026-01-29 02:45:13] Reading story file: docs/stories/story-004.md
[2026-01-29 02:45:14] Analyzing acceptance criteria...
[2026-01-29 02:45:15]
[2026-01-29 02:45:15] === Story: Implement real-time notifications ===
[2026-01-29 02:45:15] Complexity: standard | Priority: high
[2026-01-29 02:45:16]
[2026-01-29 02:45:17] Planning implementation approach...
[2026-01-29 02:45:18] ├── Create WebSocket connection hook
[2026-01-29 02:45:18] ├── Implement notification store
[2026-01-29 02:45:18] ├── Design notification UI component
[2026-01-29 02:45:18] └── Add notification preferences
[2026-01-29 02:45:19]
[2026-01-29 02:45:20] Writing: src/hooks/use-websocket.ts
[2026-01-29 02:45:25] ✓ Created WebSocket hook with auto-reconnect
[2026-01-29 02:45:26]
[2026-01-29 02:45:27] Writing: src/stores/notification-store.ts
[2026-01-29 02:45:32] ✓ Created Zustand store for notifications
[2026-01-29 02:45:33]
[2026-01-29 02:45:34] Writing: src/components/notifications/NotificationToast.tsx
[2026-01-29 02:45:40] ✓ Created toast notification component
[2026-01-29 02:45:41]
[2026-01-29 02:45:42] Running lint check...
[2026-01-29 02:45:45] ✓ No linting errors
[2026-01-29 02:45:46]
[2026-01-29 02:45:47] Running type check...
[2026-01-29 02:45:52] ✓ No type errors
[2026-01-29 02:45:53]
[2026-01-29 02:45:54] Progress: 65% complete
[2026-01-29 02:45:55] Next: Implement notification preferences UI
`.trim();

// ============ Mock Agent Terminals ============

export interface MockAgentTerminal {
  id: string;
  agentId: AgentId;
  model: string;
  apiType: string;
  workingDirectory: string;
  currentTask?: string;
  status: 'idle' | 'working' | 'waiting';
  lastPrompt?: string;
  storyId?: string;
}

export const MOCK_AGENT_TERMINALS: MockAgentTerminal[] = [
  {
    id: 'term-001',
    agentId: 'dev',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'edit run.py to ...',
    status: 'working',
    lastPrompt: '> Try "edit run.py to ..."',
    storyId: 'story-004',
  },
  {
    id: 'term-002',
    agentId: 'qa',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'fix lint errors',
    status: 'working',
    lastPrompt: '> Try "fix lint errors"',
    storyId: 'story-006',
  },
  {
    id: 'term-003',
    agentId: 'architect',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'fix lint errors',
    status: 'working',
    lastPrompt: '> Try "fix lint errors"',
    storyId: 'story-005',
  },
  {
    id: 'term-004',
    agentId: 'dev',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'edit spec_runner.py to ...',
    status: 'waiting',
    lastPrompt: '> Try "edit spec_runner.py to ..."',
  },
  {
    id: 'term-005',
    agentId: 'qa',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'write a test for agent.py',
    status: 'working',
    lastPrompt: '> Try "write a test for agent.py"',
  },
  {
    id: 'term-006',
    agentId: 'dev',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    currentTask: 'refactor spec_runner.py',
    status: 'idle',
    lastPrompt: '> Try "refactor spec_runner.py"',
  },
];

// ============ Mock Roadmap Items ============

export const MOCK_ROADMAP_ITEMS: RoadmapItem[] = [
  // Must Have
  {
    id: 'roadmap-001',
    title: 'Fix Route Detection False Positives',
    description: 'Resolve false positive detection in route analysis',
    priority: 'must_have',
    impact: 'medium',
    effort: 'low',
    category: 'fix',
    tags: ['stability'],
  },
  {
    id: 'roadmap-002',
    title: 'Expanded Test Coverage',
    description: 'Increase unit and integration test coverage to 80%',
    priority: 'must_have',
    impact: 'high',
    effort: 'medium',
    category: 'feature',
    tags: ['quality', 'testing'],
  },
  {
    id: 'roadmap-003',
    title: 'Built-in Diff Viewer',
    description: 'Native diff viewer for code changes review',
    priority: 'must_have',
    impact: 'high',
    effort: 'medium',
    category: 'feature',
    tags: ['developer-experience'],
  },
  // Should Have
  {
    id: 'roadmap-004',
    title: 'Automatic Worktree Cleanup',
    description: 'Auto-cleanup stale git worktrees after merge',
    priority: 'should_have',
    impact: 'medium',
    effort: 'low',
    category: 'feature',
    tags: ['automation'],
  },
  {
    id: 'roadmap-005',
    title: 'Project Templates & Scaffolding',
    description: 'Quick-start templates for common project types',
    priority: 'should_have',
    impact: 'high',
    effort: 'medium',
    category: 'feature',
    tags: ['developer-experience'],
  },
  {
    id: 'roadmap-006',
    title: 'Analytics Dashboard',
    description: 'Metrics and insights on agent performance',
    priority: 'should_have',
    impact: 'high',
    effort: 'medium',
    category: 'feature',
    tags: ['analytics', 'insights'],
  },
  {
    id: 'roadmap-007',
    title: 'Advanced Documentation',
    description: 'Comprehensive API docs and tutorials',
    priority: 'should_have',
    impact: 'medium',
    effort: 'medium',
    category: 'docs',
    tags: ['documentation'],
  },
  // Could Have
  {
    id: 'roadmap-008',
    title: 'Interactive Onboarding Wizard',
    description: 'Guided setup experience for new users',
    priority: 'could_have',
    impact: 'medium',
    effort: 'medium',
    category: 'feature',
    tags: ['onboarding', 'ux'],
  },
  {
    id: 'roadmap-009',
    title: 'Plugin System',
    description: 'Extensible plugin architecture for custom integrations',
    priority: 'could_have',
    impact: 'high',
    effort: 'high',
    category: 'feature',
    tags: ['extensibility'],
  },
  // Won't Have (this release)
  {
    id: 'roadmap-010',
    title: 'Multi-tenant Support',
    description: 'Support for multiple organizations/teams',
    priority: 'wont_have',
    impact: 'high',
    effort: 'high',
    category: 'feature',
    tags: ['enterprise'],
  },
];

// ============ Mock Terminal Sessions (typed) ============

export const MOCK_TERMINAL_SESSIONS: TerminalSession[] = [
  {
    id: 'term-001',
    agentId: 'dev',
    name: 'Claude (Dev)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'running',
    currentCommand: 'edit run.py to add logging',
    storyId: 'story-004',
  },
  {
    id: 'term-002',
    agentId: 'qa',
    name: 'Claude (QA)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'running',
    currentCommand: 'fix lint errors',
    storyId: 'story-006',
  },
  {
    id: 'term-003',
    agentId: 'architect',
    name: 'Claude (Architect)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'error',
    currentCommand: 'analyze dependencies',
    storyId: 'story-005',
  },
  {
    id: 'term-004',
    agentId: 'dev',
    name: 'Claude (Dev)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'idle',
  },
  {
    id: 'term-005',
    agentId: 'qa',
    name: 'Claude (QA)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'running',
    currentCommand: 'write tests for agent.py',
  },
  {
    id: 'term-006',
    agentId: 'dev',
    name: 'Claude (Dev)',
    model: 'Sonnet 4.5',
    apiType: 'Claude API',
    workingDirectory: '~/Code/aios-core',
    status: 'idle',
    currentCommand: 'refactor spec_runner.py',
  },
];

// ============ Helper Functions ============

export function getStoriesByStatus(status: Story['status']): Story[] {
  return MOCK_STORIES.filter((story) => story.status === status);
}

export function getActiveAgents(): Agent[] {
  return MOCK_AGENTS.filter((agent) => agent.status !== 'idle');
}

export function getIdleAgents(): Agent[] {
  return MOCK_AGENTS.filter((agent) => agent.status === 'idle');
}

export function getAgentById(id: AgentId): Agent | undefined {
  return MOCK_AGENTS.find((agent) => agent.id === id);
}

// ============ Mock Insights Data ============

export interface InsightsMetrics {
  velocity: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
  };
  cycleTime: {
    average: number; // hours
    byStatus: Record<string, number>;
  };
  agentActivity: {
    agentId: AgentId;
    storiesCompleted: number;
    hoursActive: number;
    successRate: number;
  }[];
  bottlenecks: {
    status: string;
    count: number;
    avgWaitTime: number; // hours
  }[];
  weeklyActivity: {
    day: string;
    stories: number;
    commits: number;
  }[];
  errorRate: {
    current: number;
    previous: number;
  };
}

export const MOCK_INSIGHTS: InsightsMetrics = {
  velocity: {
    current: 12,
    previous: 9,
    trend: 'up',
  },
  cycleTime: {
    average: 18.5,
    byStatus: {
      backlog: 48,
      in_progress: 6,
      ai_review: 2,
      human_review: 8,
      pr_created: 4,
    },
  },
  agentActivity: [
    { agentId: 'dev', storiesCompleted: 8, hoursActive: 45, successRate: 92 },
    { agentId: 'qa', storiesCompleted: 6, hoursActive: 32, successRate: 88 },
    { agentId: 'architect', storiesCompleted: 3, hoursActive: 18, successRate: 95 },
    { agentId: 'pm', storiesCompleted: 4, hoursActive: 12, successRate: 100 },
    { agentId: 'devops', storiesCompleted: 2, hoursActive: 8, successRate: 85 },
  ],
  bottlenecks: [
    { status: 'Human Review', count: 5, avgWaitTime: 12 },
    { status: 'Backlog', count: 8, avgWaitTime: 72 },
    { status: 'PR Created', count: 2, avgWaitTime: 6 },
  ],
  weeklyActivity: [
    { day: 'Mon', stories: 3, commits: 12 },
    { day: 'Tue', stories: 4, commits: 18 },
    { day: 'Wed', stories: 2, commits: 8 },
    { day: 'Thu', stories: 5, commits: 22 },
    { day: 'Fri', stories: 3, commits: 15 },
    { day: 'Sat', stories: 1, commits: 4 },
    { day: 'Sun', stories: 0, commits: 2 },
  ],
  errorRate: {
    current: 8,
    previous: 12,
  },
};

// ============ Mock Context Data ============

export interface ContextFile {
  id: string;
  name: string;
  path: string;
  type: 'rules' | 'agent' | 'config' | 'docs';
  description: string;
  lastModified: string;
  size: string;
}

export interface ContextMCP {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  tools: number;
  description: string;
}

export interface ContextData {
  projectName: string;
  projectPath: string;
  claudeMdPath: string;
  activeRules: ContextFile[];
  agentDefinitions: ContextFile[];
  configFiles: ContextFile[];
  mcpServers: ContextMCP[];
  recentFiles: string[];
}

export const MOCK_CONTEXT: ContextData = {
  projectName: 'aios-core',
  projectPath: '~/Code/aios-core',
  claudeMdPath: '.claude/CLAUDE.md',
  activeRules: [
    {
      id: 'rule-001',
      name: 'CLAUDE.md',
      path: '.claude/CLAUDE.md',
      type: 'rules',
      description: 'Main project rules and instructions',
      lastModified: '2026-01-28T10:00:00Z',
      size: '12.4 KB',
    },
    {
      id: 'rule-002',
      name: 'mcp-usage.md',
      path: '.claude/rules/mcp-usage.md',
      type: 'rules',
      description: 'MCP server usage guidelines',
      lastModified: '2026-01-27T14:00:00Z',
      size: '4.2 KB',
    },
    {
      id: 'rule-003',
      name: 'code-standards.md',
      path: '.claude/rules/code-standards.md',
      type: 'rules',
      description: 'Code formatting and standards',
      lastModified: '2026-01-25T09:00:00Z',
      size: '2.8 KB',
    },
  ],
  agentDefinitions: [
    {
      id: 'agent-001',
      name: 'dev.md',
      path: '.aios-core/development/agents/dev.md',
      type: 'agent',
      description: 'Developer agent persona and workflows',
      lastModified: '2026-01-28T16:00:00Z',
      size: '5.6 KB',
    },
    {
      id: 'agent-002',
      name: 'qa.md',
      path: '.aios-core/development/agents/qa.md',
      type: 'agent',
      description: 'QA agent testing protocols',
      lastModified: '2026-01-28T12:00:00Z',
      size: '4.1 KB',
    },
    {
      id: 'agent-003',
      name: 'architect.md',
      path: '.aios-core/development/agents/architect.md',
      type: 'agent',
      description: 'Architect agent design patterns',
      lastModified: '2026-01-26T10:00:00Z',
      size: '6.2 KB',
    },
    {
      id: 'agent-004',
      name: 'pm.md',
      path: '.aios-core/development/agents/pm.md',
      type: 'agent',
      description: 'Project manager coordination',
      lastModified: '2026-01-25T14:00:00Z',
      size: '3.8 KB',
    },
  ],
  configFiles: [
    {
      id: 'config-001',
      name: 'package.json',
      path: 'package.json',
      type: 'config',
      description: 'Node.js dependencies and scripts',
      lastModified: '2026-01-29T01:00:00Z',
      size: '2.1 KB',
    },
    {
      id: 'config-002',
      name: 'tsconfig.json',
      path: 'tsconfig.json',
      type: 'config',
      description: 'TypeScript configuration',
      lastModified: '2026-01-20T09:00:00Z',
      size: '1.2 KB',
    },
    {
      id: 'config-003',
      name: 'install-manifest.yaml',
      path: '.aios-core/install-manifest.yaml',
      type: 'config',
      description: 'AIOS installation manifest',
      lastModified: '2026-01-28T18:00:00Z',
      size: '3.4 KB',
    },
  ],
  mcpServers: [
    {
      id: 'mcp-001',
      name: 'desktop-commander',
      status: 'active',
      tools: 24,
      description: 'File operations and process management',
    },
    {
      id: 'mcp-002',
      name: 'exa',
      status: 'active',
      tools: 3,
      description: 'Web search and research',
    },
    {
      id: 'mcp-003',
      name: 'context7',
      status: 'active',
      tools: 2,
      description: 'Library documentation lookup',
    },
    {
      id: 'mcp-004',
      name: 'playwright',
      status: 'inactive',
      tools: 12,
      description: 'Browser automation',
    },
  ],
  recentFiles: [
    'src/components/terminals/TerminalOutput.tsx',
    'src/lib/mock-data.ts',
    'src/types/index.ts',
    'src/app/page.tsx',
    'src/components/github/GitHubPanel.tsx',
  ],
};
