import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { AiosStatus, AgentId } from '@/types';

// Status file path relative to project root
const STATUS_FILE_NAME = '.aios/dashboard/status.json';

// Get the project root path
// Priority: AIOS_PROJECT_ROOT env var > navigate from cwd
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  // Default: assume running from apps/dashboard/
  return path.resolve(process.cwd(), '..', '..');
}

// Default response when CLI is not running
const DISCONNECTED_STATUS: AiosStatus = {
  version: '1.0',
  updatedAt: new Date().toISOString(),
  connected: false,
  project: null,
  activeAgent: null,
  session: null,
  stories: {
    inProgress: [],
    completed: [],
  },
};

// Type guard for AgentId
function isValidAgentId(id: unknown): id is AgentId {
  return (
    typeof id === 'string' &&
    ['dev', 'qa', 'architect', 'pm', 'po', 'analyst', 'devops'].includes(id)
  );
}

// Validate status file structure
function validateStatusFile(data: unknown): AiosStatus | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Required fields
  if (typeof obj.version !== 'string') return null;
  if (typeof obj.updatedAt !== 'string') return null;

  // Validate project
  const project =
    obj.project === null
      ? null
      : typeof obj.project === 'object' && obj.project !== null
        ? {
            name: String((obj.project as Record<string, unknown>).name || ''),
            path: String((obj.project as Record<string, unknown>).path || ''),
          }
        : null;

  // Validate activeAgent
  let activeAgent: AiosStatus['activeAgent'] = null;
  if (obj.activeAgent && typeof obj.activeAgent === 'object') {
    const agent = obj.activeAgent as Record<string, unknown>;
    if (isValidAgentId(agent.id)) {
      activeAgent = {
        id: agent.id,
        name: String(agent.name || ''),
        activatedAt: String(agent.activatedAt || ''),
        currentStory: agent.currentStory ? String(agent.currentStory) : undefined,
      };
    }
  }

  // Validate session
  let session: AiosStatus['session'] = null;
  if (obj.session && typeof obj.session === 'object') {
    const s = obj.session as Record<string, unknown>;
    session = {
      startedAt: String(s.startedAt || ''),
      commandsExecuted: typeof s.commandsExecuted === 'number' ? s.commandsExecuted : 0,
      lastCommand: s.lastCommand ? String(s.lastCommand) : undefined,
    };
  }

  // Validate stories
  const stories = {
    inProgress: [] as string[],
    completed: [] as string[],
  };
  if (obj.stories && typeof obj.stories === 'object') {
    const s = obj.stories as Record<string, unknown>;
    if (Array.isArray(s.inProgress)) {
      stories.inProgress = s.inProgress.filter((x): x is string => typeof x === 'string');
    }
    if (Array.isArray(s.completed)) {
      stories.completed = s.completed.filter((x): x is string => typeof x === 'string');
    }
  }

  // Validate rateLimit (optional)
  let rateLimit: AiosStatus['rateLimit'] = undefined;
  if (obj.rateLimit && typeof obj.rateLimit === 'object') {
    const r = obj.rateLimit as Record<string, unknown>;
    if (typeof r.used === 'number' && typeof r.limit === 'number') {
      rateLimit = {
        used: r.used,
        limit: r.limit,
        resetsAt: typeof r.resetsAt === 'string' ? r.resetsAt : undefined,
      };
    }
  }

  return {
    version: obj.version,
    updatedAt: obj.updatedAt,
    connected: true,
    project,
    activeAgent,
    session,
    stories,
    rateLimit,
  };
}

export async function GET() {
  try {
    // Resolve status file path from project root
    const statusFilePath = path.join(getProjectRoot(), STATUS_FILE_NAME);

    // Try to read the status file
    const fileContent = await fs.readFile(statusFilePath, 'utf-8');

    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(fileContent);
    } catch {
      // AC4: Handle corrupted JSON
      console.error('[API /status] Invalid JSON in status file');
      return NextResponse.json(
        {
          ...DISCONNECTED_STATUS,
          error: 'Status file contains invalid JSON',
        },
        { status: 200 }
      );
    }

    // AC3: Validate schema
    const validatedStatus = validateStatusFile(data);
    if (!validatedStatus) {
      console.error('[API /status] Status file failed schema validation');
      return NextResponse.json(
        {
          ...DISCONNECTED_STATUS,
          error: 'Status file has invalid structure',
        },
        { status: 200 }
      );
    }

    // AC5: Return with connected: true
    return NextResponse.json(validatedStatus);
  } catch (error) {
    // AC2: Graceful fallback when file doesn't exist
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(DISCONNECTED_STATUS);
    }

    // Other errors
    console.error('[API /status] Error reading status file:', error);
    return NextResponse.json(
      {
        ...DISCONNECTED_STATUS,
        error: 'Failed to read status file',
      },
      { status: 200 }
    );
  }
}
