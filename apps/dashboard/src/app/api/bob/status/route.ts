import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Bob status file path relative to project root
const BOB_STATUS_FILE_NAME = '.aios/dashboard/bob-status.json';

// Get the project root path
function getProjectRoot(): string {
  if (process.env.AIOS_PROJECT_ROOT) {
    return process.env.AIOS_PROJECT_ROOT;
  }
  return path.resolve(process.cwd(), '..', '..');
}

// Default response when Bob is not running
const BOB_INACTIVE_STATUS = {
  active: false,
  message: 'Bob is not running',
};

export async function GET() {
  try {
    const statusFilePath = path.join(getProjectRoot(), BOB_STATUS_FILE_NAME);
    const fileContent = await fs.readFile(statusFilePath, 'utf-8');

    let data: unknown;
    try {
      data = JSON.parse(fileContent);
    } catch {
      console.error('[API /bob/status] Invalid JSON in bob-status file');
      return NextResponse.json(
        { ...BOB_INACTIVE_STATUS, error: 'Bob status file contains invalid JSON' },
        { status: 200 }
      );
    }

    // Return the parsed bob-status data with active flag
    const status = data as Record<string, unknown>;
    return NextResponse.json({
      active: status.orchestration
        ? (status.orchestration as Record<string, unknown>).active ?? false
        : false,
      ...status,
    });
  } catch (error) {
    // File doesn't exist — Bob is not running
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(BOB_INACTIVE_STATUS);
    }

    console.error('[API /bob/status] Error reading bob-status file:', error);
    return NextResponse.json(
      { ...BOB_INACTIVE_STATUS, error: 'Failed to read bob-status file' },
      { status: 200 }
    );
  }
}
