import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { parseRadar, OBSIDIAN_PATH } from '@/lib/parser';
import { writeRadar } from '@/lib/writer';
import type { RadarData } from '@/lib/types';

export async function GET() {
  try {
    const content = await readFile(OBSIDIAN_PATH, 'utf-8');
    const data = parseRadar(content);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read radar file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data: RadarData = await request.json();
    const content = writeRadar(data);
    await writeFile(OBSIDIAN_PATH, content, 'utf-8');
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to write radar file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
