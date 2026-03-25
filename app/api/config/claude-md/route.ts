import { NextRequest, NextResponse } from 'next/server';
import { readFileSafe, writeFileSafe, CONFIG_PATHS } from '@/lib/fs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config/claude-md
 * Read the global CLAUDE.md file
 */
export async function GET() {
  try {
    const content = await readFileSafe(CONFIG_PATHS.claudeMd);

    if (!content) {
      return NextResponse.json({ content: '', exists: false });
    }

    return NextResponse.json({ content, exists: true });
  } catch (error: unknown) {
    console.error('Failed to read CLAUDE.md:', error);
    return NextResponse.json(
      {
        error: 'Failed to read CLAUDE.md',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/claude-md
 * Write to the global CLAUDE.md file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content, expected string' },
        { status: 400 }
      );
    }

    await writeFileSafe(CONFIG_PATHS.claudeMd, content);

    return NextResponse.json({
      success: true,
      message: 'CLAUDE.md saved successfully',
    });
  } catch (error: unknown) {
    console.error('Failed to write CLAUDE.md:', error);
    return NextResponse.json(
      {
        error: 'Failed to write CLAUDE.md',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
