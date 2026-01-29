import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Story, StoryStatus, StoryComplexity, StoryPriority, StoryCategory, AgentId } from '@/types';

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
  'backlog', 'in_progress', 'ai_review', 'human_review', 'pr_created', 'done', 'error'
];
const VALID_COMPLEXITY: StoryComplexity[] = ['simple', 'standard', 'complex'];
const VALID_PRIORITY: StoryPriority[] = ['low', 'medium', 'high', 'critical'];
const VALID_CATEGORY: StoryCategory[] = ['feature', 'fix', 'refactor', 'docs'];
const VALID_AGENTS: AgentId[] = ['dev', 'qa', 'architect', 'pm', 'po', 'analyst', 'devops'];

// Parse frontmatter to Story object
function parseStoryFromMarkdown(
  content: string,
  filePath: string,
  fileStats: { mtime: Date; birthtime: Date }
): Story | null {
  try {
    const { data, content: markdownContent } = matter(content);

    // Extract title from first H1 or frontmatter
    let title = data.title;
    if (!title) {
      const h1Match = markdownContent.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : path.basename(filePath, '.md');
    }

    // Generate ID from filename or frontmatter
    const id = data.id || path.basename(filePath, '.md');

    // Parse status
    let status: StoryStatus = 'backlog';
    if (data.status && VALID_STATUS.includes(data.status)) {
      status = data.status;
    }

    // Parse complexity
    let complexity: StoryComplexity | undefined;
    if (data.complexity && VALID_COMPLEXITY.includes(data.complexity)) {
      complexity = data.complexity;
    }

    // Parse priority
    let priority: StoryPriority | undefined;
    if (data.priority && VALID_PRIORITY.includes(data.priority)) {
      priority = data.priority;
    }

    // Parse category
    let category: StoryCategory | undefined;
    if (data.category && VALID_CATEGORY.includes(data.category)) {
      category = data.category;
    }

    // Parse agent
    let agentId: AgentId | undefined;
    if (data.agent && VALID_AGENTS.includes(data.agent)) {
      agentId = data.agent;
    }

    // Extract description from frontmatter or first paragraph
    let description = data.description;
    if (!description) {
      // Try to get first paragraph after title
      const paragraphs = markdownContent
        .split('\n\n')
        .filter((p) => p.trim() && !p.startsWith('#'));
      description = paragraphs[0]?.trim().slice(0, 200) || '';
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

    return {
      id,
      title,
      description,
      status,
      epicId: data.epicId || data.epic,
      complexity,
      priority,
      category,
      agentId,
      progress: typeof data.progress === 'number' ? data.progress : undefined,
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
        // Skip hidden directories and node_modules
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await findMarkdownFiles(fullPath));
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
      description: 'Sidebar doesn\'t collapse properly on mobile',
      status: 'ai_review',
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
      complexity: 'simple',
      priority: 'low',
      category: 'docs',
      filePath: 'mock/docs.md',
      createdAt: now,
      updatedAt: now,
    },
  ];
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
