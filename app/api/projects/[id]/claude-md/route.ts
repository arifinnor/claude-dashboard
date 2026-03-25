import { NextRequest, NextResponse } from 'next/server';
import { readProjectClaudeMd, writeProjectClaudeMd, listProjects } from '@/lib/fs';
import { validateProjectId } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/claude-md
 * Read a project's CLAUDE.md file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate project ID
    const validation = validateProjectId(id);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID', errors: validation.errors },
        { status: 400 }
      );
    }

    const content = await readProjectClaudeMd(id);

    if (!content) {
      return NextResponse.json({ content: '', exists: false });
    }

    return NextResponse.json({ content, exists: true });
  } catch (error: any) {
    console.error(`Failed to read project CLAUDE.md:`, error);
    return NextResponse.json(
      { error: 'Failed to read project CLAUDE.md', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/claude-md
 * Write to a project's CLAUDE.md file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate project ID
    const validation = validateProjectId(id);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID', errors: validation.errors },
        { status: 400 }
      );
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content, expected string' },
        { status: 400 }
      );
    }

    await writeProjectClaudeMd(id, content);

    return NextResponse.json({
      success: true,
      message: 'Project CLAUDE.md saved successfully',
    });
  } catch (error: any) {
    console.error(`Failed to write project CLAUDE.md:`, error);
    return NextResponse.json(
      { error: 'Failed to write project CLAUDE.md', details: error.message },
      { status: 500 }
    );
  }
}
