import { NextRequest, NextResponse } from 'next/server';
import { readFileSafe, writeJsonFile, CONFIG_PATHS } from '@/lib/fs';
import { validateSettings } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config/settings
 * Read the global settings.json file
 */
export async function GET() {
  try {
    const content = await readFileSafe(CONFIG_PATHS.settings);

    if (!content) {
      return NextResponse.json({ settings: null, exists: false });
    }

    const settings = JSON.parse(content);
    return NextResponse.json({ settings, exists: true });
  } catch (error: any) {
    console.error('Failed to read settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/settings
 * Write to the global settings.json file
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

    await writeJsonFile(CONFIG_PATHS.settings, validation.data!);

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error: any) {
    console.error('Failed to write settings:', error);
    return NextResponse.json(
      { error: 'Failed to write settings', details: error.message },
      { status: 500 }
    );
  }
}
