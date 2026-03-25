import { NextResponse } from 'next/server';
import { listProjects } from '@/lib/fs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects
 * List all Claude Code projects
 */
export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Failed to list projects:', error);
    return NextResponse.json(
      { error: 'Failed to list projects', details: error.message },
      { status: 500 }
    );
  }
}
