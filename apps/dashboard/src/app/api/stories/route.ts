import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  Story,
  StoryStatus,
  StoryComplexity,
  StoryPriority,
  StoryCategory,
  StoryType,
  AgentId,
} from '@/types';

// Get the project root path
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  // Default: assume running from apps/dashboard/
  return path.resolve(process.cwd(), '..', '..');
}

// Valid values for type checking
const VALID_STATUS: StoryStatus[] = [
  'backlog',
  'in_progress',
  'ai_review',
  'human_review',
  'pr_created',
  'done',
  'error',
];
const VALID_COMPLEXITY: StoryComplexity[] = ['simple', 'standard', 'complex'];
const VALID_PRIORITY: StoryPriority[] = ['low', 'medium', 'high', 'critical'];
const VALID_CATEGORY: StoryCategory[] = ['feature', 'fix', 'refactor', 'docs'];
const VALID_AGENTS: AgentId[] = ['dev', 'qa', 'architect', 'pm', 'po', 'analyst', 'devops'];

// Priority mapping from P0/P1/P2/P3 format to enum
const PRIORITY_MAP: Record<string, StoryPriority> = {
  p0: 'critical',
  p1: 'high',
  p2: 'medium',
  p3: 'low',
};

// Status mapping from document format to enum
const STATUS_MAP: Record<string, StoryStatus> = {
  draft: 'backlog',
  ready: 'backlog',
  'in progress': 'in_progress',
  'in-progress': 'in_progress',
  review: 'ai_review',
  'ai review': 'ai_review',
  'ready for review': 'human_review',
  'human review': 'human_review',
  'pr created': 'pr_created',
  'pr ready': 'pr_created',
  done: 'done',
  complete: 'done',
  completed: 'done',
  implemented: 'done',
  error: 'error',
  blocked: 'error',
};

// Parse blockquote metadata format used in epic/story files
// Format: > **Field:** Value
function parseBlockquoteMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Match blockquote lines with bold field names
  // > **Priority:** P0 - Foundation
  // > **Status:** Draft
  const blockquoteRegex = /^>\s*\*\*([^*]+)\*\*:\s*(.+)$/gm;
  let match;

  while ((match = blockquoteRegex.exec(content)) !== null) {
    const field = match[1].trim().toLowerCase();
    const value = match[2].trim();
    metadata[field] = value;
  }

  return metadata;
}

// Extract priority from blockquote format (e.g., "P0 - Foundation" -> "critical")
function extractPriorityFromBlockquote(value: string): StoryPriority | undefined {
  if (!value) return undefined;

  // Extract P0, P1, P2, P3 from strings like "P0 - Foundation", "P1 - Core"
  const pMatch = value.match(/^(p[0-3])/i);
  if (pMatch) {
    return PRIORITY_MAP[pMatch[1].toLowerCase()];
  }

  // Also support direct priority names
  const lowerValue = value.toLowerCase();
  if (VALID_PRIORITY.includes(lowerValue as StoryPriority)) {
    return lowerValue as StoryPriority;
  }

  return undefined;
}

// Extract status from blockquote format
function extractStatusFromBlockquote(value: string): StoryStatus | undefined {
  if (!value) return undefined;

  const lowerValue = value.toLowerCase().trim();

  // Check direct mapping
  if (STATUS_MAP[lowerValue]) {
    return STATUS_MAP[lowerValue];
  }

  // Check if it's a valid status directly
  if (VALID_STATUS.includes(lowerValue as StoryStatus)) {
    return lowerValue as StoryStatus;
  }

  return undefined;
}

// Parse markdown table metadata format
// Format: | **Field** | Value |
function parseTableMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Match table rows with bold field names
  // | **Status** | Done |
  // | **Priority** | P1 |
  const tableRegex = /^\|\s*\*\*([^*|]+)\*\*\s*\|\s*([^|]+)\s*\|/gm;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const field = match[1].trim().toLowerCase();
    const value = match[2].trim();
    metadata[field] = value;
  }

  return metadata;
}

// Parse inline bold metadata format (not in blockquote)
// Format: **Field:** Value
function parseInlineMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Match inline bold fields not in blockquote
  // **Status:** Done
  // **Priority:** P1
  const inlineRegex = /(?<!>.*)\*\*([^*:]+)\*\*:\s*([^\n|]+)/g;
  let match;

  while ((match = inlineRegex.exec(content)) !== null) {
    const field = match[1].trim().toLowerCase();
    const value = match[2].trim();
    metadata[field] = value;
  }

  return metadata;
}

// Extract status from table format with emoji handling
function extractStatusFromTable(value: string): StoryStatus | undefined {
  if (!value) return undefined;

  // Remove common emojis at the start
  const cleanValue = value
    .replace(/^[\u{1F4DD}\u{2705}\u{1F534}\u{1F7E1}\u{1F7E2}\u{26AA}\u{1F535}\u{23F3}\u{1F6A7}\u{274C}\u{26A0}\u{1F3AF}\u{2714}\u{2716}]\s*/u, '')
    .toLowerCase()
    .trim();

  // Check direct mapping
  if (STATUS_MAP[cleanValue]) {
    return STATUS_MAP[cleanValue];
  }

  // Check if it's a valid status directly
  if (VALID_STATUS.includes(cleanValue as StoryStatus)) {
    return cleanValue as StoryStatus;
  }

  return undefined;
}

// Extract priority from table format with emoji handling
function extractPriorityFromTable(value: string): StoryPriority | undefined {
  if (!value) return undefined;

  // Remove common emojis
  const cleanValue = value
    .replace(/^[\u{1F534}\u{1F7E0}\u{1F7E1}\u{1F7E2}\u{26AA}\u{2B50}\u{1F525}]\s*/u, '')
    .trim();

  // Extract P0, P1, P2, P3 from strings like "P0 - Foundation", "P1 - Core"
  const pMatch = cleanValue.match(/^(p[0-3])/i);
  if (pMatch) {
    return PRIORITY_MAP[pMatch[1].toLowerCase()];
  }

  // Also support direct priority names
  const lowerValue = cleanValue.toLowerCase();
  if (VALID_PRIORITY.includes(lowerValue as StoryPriority)) {
    return lowerValue as StoryPriority;
  }

  return undefined;
}

// Parse frontmatter to Story object
function parseStoryFromMarkdown(
  content: string,
  filePath: string,
  fileStats: { mtime: Date; birthtime: Date }
): Story | null {
  try {
    const { data, content: markdownContent } = matter(content);

    // Parse all metadata formats as fallback for fields not in frontmatter
    const blockquoteMeta = parseBlockquoteMetadata(markdownContent);
    const tableMeta = parseTableMetadata(markdownContent);
    const inlineMeta = parseInlineMetadata(markdownContent);

    // Extract title from first H1 or frontmatter
    let title = data.title;
    if (!title) {
      const h1Match = markdownContent.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : path.basename(filePath, '.md');
    }

    // Generate ID from filename or frontmatter
    const id = data.id || path.basename(filePath, '.md');

    // Detect type: epic vs story based on filename or frontmatter
    const filename = path.basename(filePath).toLowerCase();
    let storyType: StoryType = 'story';
    if (data.type === 'epic' || data.type === 'story') {
      storyType = data.type;
    } else if (filename.startsWith('epic-') || filename.includes('-epic')) {
      storyType = 'epic';
    } else if (title.toLowerCase().startsWith('epic')) {
      storyType = 'epic';
    }

    // Parse status - frontmatter first, then table, inline, blockquote fallback
    let status: StoryStatus = 'backlog';
    if (data.status && VALID_STATUS.includes(data.status)) {
      status = data.status;
    } else if (tableMeta.status) {
      const tableStatus = extractStatusFromTable(tableMeta.status);
      if (tableStatus) {
        status = tableStatus;
      }
    } else if (inlineMeta.status) {
      const inlineStatus = extractStatusFromTable(inlineMeta.status);
      if (inlineStatus) {
        status = inlineStatus;
      }
    } else if (blockquoteMeta.status) {
      const blockquoteStatus = extractStatusFromBlockquote(blockquoteMeta.status);
      if (blockquoteStatus) {
        status = blockquoteStatus;
      }
    }

    // Parse complexity - frontmatter first, then blockquote fallback
    let complexity: StoryComplexity | undefined;
    if (data.complexity && VALID_COMPLEXITY.includes(data.complexity)) {
      complexity = data.complexity;
    } else if (blockquoteMeta.complexity) {
      const lowerComplexity = blockquoteMeta.complexity.toLowerCase();
      if (VALID_COMPLEXITY.includes(lowerComplexity as StoryComplexity)) {
        complexity = lowerComplexity as StoryComplexity;
      }
    }

    // Parse priority - frontmatter first, then table, inline, blockquote fallback
    let priority: StoryPriority | undefined;
    if (data.priority && VALID_PRIORITY.includes(data.priority)) {
      priority = data.priority;
    } else if (tableMeta.priority) {
      priority = extractPriorityFromTable(tableMeta.priority);
    } else if (inlineMeta.priority) {
      priority = extractPriorityFromTable(inlineMeta.priority);
    } else if (blockquoteMeta.priority) {
      priority = extractPriorityFromBlockquote(blockquoteMeta.priority);
    }

    // Parse category - frontmatter first, then blockquote fallback
    let category: StoryCategory | undefined;
    if (data.category && VALID_CATEGORY.includes(data.category)) {
      category = data.category;
    } else if (blockquoteMeta.category || blockquoteMeta.type) {
      const catValue = (blockquoteMeta.category || blockquoteMeta.type || '').toLowerCase();
      if (VALID_CATEGORY.includes(catValue as StoryCategory)) {
        category = catValue as StoryCategory;
      }
    }

    // Parse agent - frontmatter first, then blockquote fallback
    let agentId: AgentId | undefined;
    if (data.agent && VALID_AGENTS.includes(data.agent)) {
      agentId = data.agent;
    } else if (blockquoteMeta.agent || blockquoteMeta.owner) {
      const agentValue = (blockquoteMeta.agent || blockquoteMeta.owner || '')
        .toLowerCase()
        .replace('@', '');
      if (VALID_AGENTS.includes(agentValue as AgentId)) {
        agentId = agentValue as AgentId;
      }
    }

    // Extract description from frontmatter, Epic Goal section, or first paragraph
    let description = data.description;
    if (!description) {
      // Try to get Epic Goal section first
      const epicGoalMatch = markdownContent.match(/## Epic Goal\n\n([\s\S]*?)(?=\n---|\n##|$)/i);
      if (epicGoalMatch) {
        description = epicGoalMatch[1].trim().split('\n\n')[0].slice(0, 200);
      } else {
        // Fall back to first non-blockquote paragraph after title
        const paragraphs = markdownContent
          .split('\n\n')
          .filter((p) => p.trim() && !p.startsWith('#') && !p.startsWith('>'));
        description = paragraphs[0]?.trim().slice(0, 200) || '';
      }
    }

    // Parse acceptance criteria from markdown
    const acMatch = markdownContent.match(/## Acceptance Criteria\n([\s\S]*?)(?=\n##|$)/i);
    let acceptanceCriteria: string[] = [];
    if (acMatch) {
      acceptanceCriteria = acMatch[1]
        .split('\n')
        .filter((line) => line.match(/^-\s*\[[ x]\]/i))
        .map((line) => line.replace(/^-\s*\[[ x]\]\s*/i, '').trim());
    }

    // Parse technical notes
    const techMatch = markdownContent.match(/## Technical Notes\n([\s\S]*?)(?=\n##|$)/i);
    const technicalNotes = techMatch ? techMatch[1].trim() : undefined;

    // Extract epicId from frontmatter or filename pattern (epic-N-*)
    let epicId = data.epicId || data.epic;
    if (!epicId) {
      const epicMatch = path.basename(filePath).match(/^epic-(\d+)/i);
      if (epicMatch) {
        epicId = `epic-${epicMatch[1]}`;
      }
    }

    // Calculate progress from acceptance criteria completion
    let progress = typeof data.progress === 'number' ? data.progress : undefined;
    if (progress === undefined && acceptanceCriteria.length > 0) {
      // Count completed criteria from original markdown
      const completedMatch = markdownContent.match(/- \[x\]/gi);
      const totalMatch = markdownContent.match(/- \[[ x]\]/gi);
      if (totalMatch && totalMatch.length > 0) {
        const completed = completedMatch?.length || 0;
        progress = Math.round((completed / totalMatch.length) * 100);
      }
    }

    return {
      id,
      title,
      description,
      status,
      type: storyType,
      epicId,
      complexity,
      priority,
      category,
      agentId,
      progress,
      acceptanceCriteria,
      technicalNotes,
      filePath,
      createdAt: data.createdAt || fileStats.birthtime.toISOString(),
      updatedAt: data.updatedAt || fileStats.mtime.toISOString(),
    };
  } catch (error) {
    console.error(`Error parsing story from ${filePath}:`, error);
    return null;
  }
}

// Recursively find all markdown files
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories, node_modules, archive, and obsolete
        const skipDirs = ['node_modules', 'archive', 'obsolete', 'archived', 'deprecated'];
        if (!entry.name.startsWith('.') && !skipDirs.includes(entry.name.toLowerCase())) {
          files.push(...(await findMarkdownFiles(fullPath)));
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Skip files that are clearly not stories
        if (!['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md'].includes(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files;
}

// Mock stories for development
function getMockStories(): Story[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'mock-1',
      title: 'Implement User Authentication',
      description: 'Add JWT-based authentication with login/register flows',
      status: 'in_progress',
      type: 'story',
      complexity: 'standard',
      priority: 'high',
      category: 'feature',
      agentId: 'dev',
      progress: 45,
      acceptanceCriteria: ['User can register', 'User can login', 'JWT tokens work'],
      filePath: 'mock/auth.md',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mock-2',
      title: 'Fix Navigation Bug',
      description: "Sidebar doesn't collapse properly on mobile",
      status: 'ai_review',
      type: 'story',
      complexity: 'simple',
      priority: 'medium',
      category: 'fix',
      agentId: 'qa',
      filePath: 'mock/nav-bug.md',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mock-3',
      title: 'Add Dark Mode Support',
      description: 'Implement system-aware dark mode toggle',
      status: 'backlog',
      type: 'story',
      complexity: 'standard',
      priority: 'low',
      category: 'feature',
      filePath: 'mock/dark-mode.md',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mock-4',
      title: 'Refactor API Routes',
      description: 'Consolidate duplicate API logic into shared utilities',
      status: 'human_review',
      type: 'story',
      complexity: 'complex',
      priority: 'medium',
      category: 'refactor',
      filePath: 'mock/api-refactor.md',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'mock-5',
      title: 'Update Documentation',
      description: 'Add API reference documentation for new endpoints',
      status: 'done',
      type: 'story',
      complexity: 'simple',
      priority: 'low',
      category: 'docs',
      filePath: 'mock/docs.md',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// Generate story filename from title
function generateStoryFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const timestamp = Date.now();
  return `${slug}-${timestamp}.md`;
}

// Generate frontmatter from story data
function generateStoryContent(data: CreateStoryRequest): string {
  const frontmatter = [
    '---',
    `title: "${data.title.replace(/"/g, '\\"')}"`,
    `status: ${data.status || 'backlog'}`,
    `type: ${data.type || 'story'}`,
  ];

  if (data.priority) frontmatter.push(`priority: ${data.priority}`);
  if (data.complexity) frontmatter.push(`complexity: ${data.complexity}`);
  if (data.category) frontmatter.push(`category: ${data.category}`);
  if (data.agent) frontmatter.push(`agent: ${data.agent}`);
  if (data.epicId) frontmatter.push(`epicId: "${data.epicId}"`);

  frontmatter.push(`createdAt: "${new Date().toISOString()}"`);
  frontmatter.push('---');
  frontmatter.push('');
  frontmatter.push(`# ${data.title}`);
  frontmatter.push('');

  if (data.description) {
    frontmatter.push(data.description);
    frontmatter.push('');
  }

  if (data.acceptanceCriteria && data.acceptanceCriteria.length > 0) {
    frontmatter.push('## Acceptance Criteria');
    frontmatter.push('');
    for (const criterion of data.acceptanceCriteria) {
      frontmatter.push(`- [ ] ${criterion}`);
    }
    frontmatter.push('');
  }

  if (data.technicalNotes) {
    frontmatter.push('## Technical Notes');
    frontmatter.push('');
    frontmatter.push(data.technicalNotes);
    frontmatter.push('');
  }

  return frontmatter.join('\n');
}

interface CreateStoryRequest {
  title: string;
  description?: string;
  status?: StoryStatus;
  type?: StoryType;
  priority?: StoryPriority;
  complexity?: StoryComplexity;
  category?: StoryCategory;
  agent?: AgentId;
  epicId?: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}

export async function GET() {
  try {
    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    // Find all markdown files
    const markdownFiles = await findMarkdownFiles(storiesDir);

    // If no stories found, return mock data in development
    if (markdownFiles.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          stories: getMockStories(),
          source: 'mock',
          message: 'No stories found, using mock data',
        });
      }
      return NextResponse.json({
        stories: [],
        source: 'empty',
        message: 'No stories found in docs/stories/',
      });
    }

    // Parse all story files
    const stories: Story[] = [];

    for (const filePath of markdownFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        const relativePath = path.relative(projectRoot, filePath);

        const story = parseStoryFromMarkdown(content, relativePath, {
          mtime: stats.mtime,
          birthtime: stats.birthtime,
        });

        if (story) {
          stories.push(story);
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }

    return NextResponse.json({
      stories,
      source: 'filesystem',
      count: stories.length,
    });
  } catch (error) {
    console.error('Error in /api/stories:', error);

    // Return mock data on error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        stories: getMockStories(),
        source: 'mock',
        error: 'Failed to read stories, using mock data',
      });
    }

    return NextResponse.json(
      {
        stories: [],
        source: 'error',
        error: 'Failed to load stories',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateStoryRequest;

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    // Ensure stories directory exists
    try {
      await fs.mkdir(storiesDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }

    // Generate filename and content
    const filename = generateStoryFilename(body.title);
    const filePath = path.join(storiesDir, filename);
    const content = generateStoryContent(body);

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    // Get file stats and parse back to Story object
    const stats = await fs.stat(filePath);
    const relativePath = path.relative(projectRoot, filePath);
    const story = parseStoryFromMarkdown(content, relativePath, {
      mtime: stats.mtime,
      birthtime: stats.birthtime,
    });

    if (!story) {
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }

    return NextResponse.json(
      {
        story,
        filePath: relativePath,
        message: 'Story created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
