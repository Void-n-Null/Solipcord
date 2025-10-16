import { NextRequest, NextResponse } from 'next/server';
import { dmListenerService } from '@/services/dm-listener.service';

/**
 * Initialize the DM listener service
 * POST /api/dm-listener/initialize
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'initialize') {
      // Initialize the service
      await dmListenerService.initialize();

      return NextResponse.json({
        success: true,
        message: 'DM listener service initialized',
        status: dmListenerService.getStatus(),
      });
    }

    if (action === 'shutdown') {
      // Shutdown the service
      dmListenerService.shutdown();

      return NextResponse.json({
        success: true,
        message: 'DM listener service shut down',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=initialize or ?action=shutdown' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to manage DM listener service:', error);
    return NextResponse.json(
      { error: 'Failed to manage DM listener service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get the status of the DM listener service
 * GET /api/dm-listener
 */
export async function GET() {
  try {
    const status = dmListenerService.getStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Failed to get DM listener status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
