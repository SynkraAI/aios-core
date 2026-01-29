import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Story, StoryStatus, StoryComplexity, StoryPriority, StoryCategory, AgentId } from '@/types';

// Get the project root path
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
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

// Recursively find a story file by ID
async function findStoryFile(dir: string, storyId: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const found = await findStoryFile(fullPath, storyId);
          if (found) return found;
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Check if this file matches the story ID
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data } = matter(content);

        const fileId = data.id || path.basename(fullPath, '.md');
        if (fileId === storyId) {
          return fullPath;
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return null;
}

// Parse story from file
function parseStoryFromFile(
  content: string,
  filePath: string,
  stats: { mtime: Date; birthtime: Date }
): Story | null {
  try {
    const { data, content: markdownContent } = matter(content);
    const projectRoot = getProjectRoot();

    // Extract title
    let title = data.title;
    if (!title) {
      const h1Match = markdownContent.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : path.basename(filePath, '.md');
    }

    const id = data.id || path.basename(filePath, '.md');

    let status: StoryStatus = 'backlog';
    if (data.status && VALID_STATUS.includes(data.status)) {
      status = data.status;
    }

    let complexity: StoryComplexity | undefined;
    if (data.complexity && VALID_COMPLEXITY.includes(data.complexity)) {
      complexity = data.complexity;
    }

    let priority: StoryPriority | undefined;
    if (data.priority && VALID_PRIORITY.includes(data.priority)) {
      priority = data.priority;
    }

    let category: StoryCategory | undefined;
    if (data.category && VALID_CATEGORY.includes(data.category)) {
      category = data.category;
    }

    let agentId: AgentId | undefined;
    if (data.agent && VALID_AGENTS.includes(data.agent)) {
      agentId = data.agent;
    }

    let description = data.description;
    if (!description) {
      const paragraphs = markdownContent
        .split('\n\n')
        .filter((p) => p.trim() && !p.startsWith('#'));
      description = paragraphs[0]?.trim().slice(0, 200) || '';
    }

    const acMatch = markdownContent.match(/## Acceptance Criteria\n([\s\S]*?)(?=\n##|$)/i);
    let acceptanceCriteria: string[] = [];
    if (acMatch) {
      acceptanceCriteria = acMatch[1]
        .split('\n')
        .filter((line) => line.match(/^-\s*\[[ x]\]/i))
        .map((line) => line.replace(/^-\s*\[[ x]\]\s*/i, '').trim());
    }

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
      filePath: path.relative(projectRoot, filePath),
      createdAt: data.createdAt || stats.birthtime.toISOString(),
      updatedAt: data.updatedAt || stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

interface UpdateStoryRequest {
  title?: string;
  description?: string;
  status?: StoryStatus;
  priority?: StoryPriority;
  complexity?: StoryComplexity;
  category?: StoryCategory;
  agent?: AgentId;
  epicId?: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
  progress?: number;
}

// GET /api/stories/[id] - Get a single story
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    const filePath = await findStoryFile(storiesDir, id);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const story = parseStoryFromFile(content, filePath, {
      mtime: stats.mtime,
      birthtime: stats.birthtime,
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Failed to parse story' },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });

  } catch (error) {
    console.error('Error getting story:', error);
    return NextResponse.json(
      { error: 'Failed to get story' },
      { status: 500 }
    );
  }
}

// PUT /api/stories/[id] - Update a story
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateStoryRequest;

    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    const filePath = await findStoryFile(storiesDir, id);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Read existing content
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { data: existingData, content: markdownContent } = matter(existingContent);

    // Merge updates with existing data
    const updatedData: Record<string, unknown> = {
      ...existingData,
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) updatedData.title = body.title;
    if (body.status !== undefined && VALID_STATUS.includes(body.status)) {
      updatedData.status = body.status;
    }
    if (body.priority !== undefined && (body.priority === null || VALID_PRIORITY.includes(body.priority))) {
      updatedData.priority = body.priority;
    }
    if (body.complexity !== undefined && (body.complexity === null || VALID_COMPLEXITY.includes(body.complexity))) {
      updatedData.complexity = body.complexity;
    }
    if (body.category !== undefined && (body.category === null || VALID_CATEGORY.includes(body.category))) {
      updatedData.category = body.category;
    }
    if (body.agent !== undefined && (body.agent === null || VALID_AGENTS.includes(body.agent))) {
      updatedData.agent = body.agent;
    }
    if (body.epicId !== undefined) updatedData.epicId = body.epicId;
    if (body.description !== undefined) updatedData.description = body.description;
    if (body.progress !== undefined) updatedData.progress = body.progress;

    // Rebuild markdown content
    let newMarkdownContent = markdownContent;

    // Update title in content if changed
    if (body.title && body.title !== existingData.title) {
      newMarkdownContent = newMarkdownContent.replace(
        /^#\s+.+$/m,
        `# ${body.title}`
      );
    }

    // Update acceptance criteria if provided
    if (body.acceptanceCriteria !== undefined) {
      const acSection = body.acceptanceCriteria.length > 0
        ? `## Acceptance Criteria\n\n${body.acceptanceCriteria.map((c) => `- [ ] ${c}`).join('\n')}`
        : '';

      if (newMarkdownContent.includes('## Acceptance Criteria')) {
        newMarkdownContent = newMarkdownContent.replace(
          /## Acceptance Criteria\n[\s\S]*?(?=\n##|$)/i,
          acSection
        );
      } else if (acSection) {
        newMarkdownContent = newMarkdownContent.trim() + '\n\n' + acSection;
      }
    }

    // Update technical notes if provided
    if (body.technicalNotes !== undefined) {
      const techSection = body.technicalNotes
        ? `## Technical Notes\n\n${body.technicalNotes}`
        : '';

      if (newMarkdownContent.includes('## Technical Notes')) {
        newMarkdownContent = newMarkdownContent.replace(
          /## Technical Notes\n[\s\S]*?(?=\n##|$)/i,
          techSection
        );
      } else if (techSection) {
        newMarkdownContent = newMarkdownContent.trim() + '\n\n' + techSection;
      }
    }

    // Write updated content
    const updatedContent = matter.stringify(newMarkdownContent, updatedData);
    await fs.writeFile(filePath, updatedContent, 'utf-8');

    // Parse and return updated story
    const stats = await fs.stat(filePath);
    const story = parseStoryFromFile(updatedContent, filePath, {
      mtime: stats.mtime,
      birthtime: stats.birthtime,
    });

    return NextResponse.json({
      story,
      message: 'Story updated successfully',
    });

  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id] - Delete a story
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectRoot = getProjectRoot();
    const storiesDir = path.join(projectRoot, 'docs', 'stories');

    const filePath = await findStoryFile(storiesDir, id);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Option 1: Move to archive instead of delete
    const archiveDir = path.join(projectRoot, 'docs', 'stories', '.archive');
    try {
      await fs.mkdir(archiveDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }

    const filename = path.basename(filePath);
    const archivePath = path.join(archiveDir, `${Date.now()}-${filename}`);

    // Move to archive
    await fs.rename(filePath, archivePath);

    return NextResponse.json({
      message: 'Story archived successfully',
      archivedTo: path.relative(projectRoot, archivePath),
    });

  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
