import { NextRequest, NextResponse } from 'next/server';
import { readFileSafe, writeJsonFile, CONFIG_PATHS } from '@/lib/fs';
import { validateSettings } from '@/lib/validation';
import { unlink } from 'fs/promises';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config/settings-local
 * Read the settings.local.json file (if exists)
 */
export async function GET() {
  try {
    const content = await readFileSafe(CONFIG_PATHS.settingsLocal);

    if (!content) {
      return NextResponse.json({ settings: null, exists: false });
    }

    const settings = JSON.parse(content);
    return NextResponse.json({ settings, exists: true });
  } catch (error: unknown) {
    console.error('Failed to read local settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to read local settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/settings-local
 * Write to the settings.local.json file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings object' },
        { status: 400 }
      );
    }

    // Validate settings
    const validation = validateSettings(settings);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid settings', errors: validation.errors },
        { status: 400 }
      );
    }

    await writeJsonFile(CONFIG_PATHS.settingsLocal, validation.data!);

    return NextResponse.json({
      success: true,
      message: 'Local settings saved successfully',
    });
  } catch (error: unknown) {
    console.error('Failed to write local settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to write local settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/config/settings-local
 * Delete the settings.local.json file
 */
export async function DELETE() {
  try {
    try {
      await unlink(CONFIG_PATHS.settingsLocal);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // File doesn't exist, that's fine
        return NextResponse.json({
          success: true,
          message: 'Local settings deleted successfully',
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Local settings deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Failed to delete local settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete local settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
