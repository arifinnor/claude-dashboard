import { NextRequest } from 'next/server';
import fileWatcher from '@/lib/watcher';
import { FileChangeEvent } from '@/lib/watcher';

export const dynamic = 'force-dynamic';

/**
 * GET /api/watch
 * Server-Sent Events endpoint for real-time file changes
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Handle file changes
      const handleChange = (change: FileChangeEvent) => {
        const data = `data: ${JSON.stringify(change)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Handle errors
      const handleError = (error: Error) => {
        const data = `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Listen for file changes
      fileWatcher.on('change', handleChange);
      fileWatcher.on('error', handleError);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        fileWatcher.off('change', handleChange);
        fileWatcher.off('error', handleError);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
