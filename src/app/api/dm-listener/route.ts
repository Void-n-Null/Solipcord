import { NextRequest, NextResponse } from 'next/server';
import { aiOrchestrationService } from '@/services/ai-orchestration.service';

/**
 * Initialize the AI Orchestration service
 * POST /api/dm-listener/initialize
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'initialize') {
      // Initialize the service
      await aiOrchestrationService.initialize();

      return NextResponse.json({
        success: true,
        message: 'AI Orchestration service initialized',
        status: aiOrchestrationService.getStatus(),
      });
    }

    if (action === 'shutdown') {
      // Shutdown the service
      aiOrchestrationService.shutdown();

      return NextResponse.json({
        success: true,
        message: 'AI Orchestration service shut down',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=initialize or ?action=shutdown' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to manage AI Orchestration service:', error);
    return NextResponse.json(
      { error: 'Failed to manage AI Orchestration service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get the status of the AI Orchestration service
 * GET /api/dm-listener
 */
export async function GET() {
  try {
    const status = aiOrchestrationService.getStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Failed to get AI Orchestration status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
