import { NextRequest, NextResponse } from 'next/server';
import { getMemoryFiles } from '@/lib/fs';
import { validateProjectId } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/memory
 * List all memory files for a project
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

    const files = await getMemoryFiles(id);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error(`Failed to list memory files for project:`, error);
    return NextResponse.json(
      { error: 'Failed to list memory files', details: error.message },
      { status: 500 }
    );
  }
}
