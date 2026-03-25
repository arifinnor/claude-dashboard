import { NextRequest, NextResponse } from 'next/server';
import {
  readMemoryFile,
  writeMemoryFile,
  deleteMemoryFile,
  getMemoryFiles,
} from '@/lib/fs';
import { validateProjectId, validateMemoryFile } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/memory/[file]
 * Read a specific memory file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  try {
    const { id, file } = await params;

    // Validate project ID
    const projectIdValidation = validateProjectId(id);
    if (!projectIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID', errors: projectIdValidation.errors },
        { status: 400 }
      );
    }

    // Validate filename
    const fileValidation = validateMemoryFile(file, '');
    if (!fileValidation.success) {
      return NextResponse.json(
        { error: 'Invalid filename', errors: fileValidation.errors },
        { status: 400 }
      );
    }

    const content = await readMemoryFile(id, file);

    if (!content) {
      return NextResponse.json(
        { error: 'Memory file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content, filename: file });
  } catch (error: any) {
    console.error(`Failed to read memory file:`, error);
    return NextResponse.json(
      { error: 'Failed to read memory file', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/memory/[file]
 * Write to a memory file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  try {
    const { id, file } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate project ID
    const projectIdValidation = validateProjectId(id);
    if (!projectIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID', errors: projectIdValidation.errors },
        { status: 400 }
      );
    }

    // Validate filename and content
    const fileValidation = validateMemoryFile(file, content ?? '');
    if (!fileValidation.success) {
      return NextResponse.json(
        { error: 'Invalid memory file', errors: fileValidation.errors },
        { status: 400 }
      );
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content, expected string' },
        { status: 400 }
      );
    }

    await writeMemoryFile(id, file, content);

    return NextResponse.json({
      success: true,
      message: 'Memory file saved successfully',
    });
  } catch (error: any) {
    console.error(`Failed to write memory file:`, error);
    return NextResponse.json(
      { error: 'Failed to write memory file', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/memory/[file]
 * Delete a memory file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; file: string }> }
) {
  try {
    const { id, file } = await params;

    // Validate project ID
    const projectIdValidation = validateProjectId(id);
    if (!projectIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid project ID', errors: projectIdValidation.errors },
        { status: 400 }
      );
    }

    // Validate filename
    const fileValidation = validateMemoryFile(file, '');
    if (!fileValidation.success) {
      return NextResponse.json(
        { error: 'Invalid filename', errors: fileValidation.errors },
        { status: 400 }
      );
    }

    const deleted = await deleteMemoryFile(id, file);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Memory file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Memory file deleted successfully',
    });
  } catch (error: any) {
    console.error(`Failed to delete memory file:`, error);
    return NextResponse.json(
      { error: 'Failed to delete memory file', details: error.message },
      { status: 500 }
    );
  }
}
