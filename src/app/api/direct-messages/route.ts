import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personaId } = body;

    if (!personaId || typeof personaId !== 'string') {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    const directMessage = await db.createDirectMessage(personaId);
    
    // Notify the AI orchestration service about the new DM conversation
    try {
      const { aiOrchestrationService } = await import('@/services/ai-orchestration.service');
      const persona = await db.getPersonaById(personaId);
      if (persona) {
        aiOrchestrationService.addDMListener(directMessage.id, personaId, persona.username);
      }
    } catch (error) {
      console.error('Failed to add DM listener:', error);
      // Don't fail the request if listener setup fails
    }
    
    return NextResponse.json(directMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to create direct message:', error);
    return NextResponse.json(
      { error: 'Failed to create direct message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const directMessages = await db.getAllDirectMessages();
    return NextResponse.json(directMessages);
  } catch (error) {
    console.error('Failed to fetch direct messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch direct messages' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const directMessageId = searchParams.get('id');

    if (!directMessageId) {
      return NextResponse.json(
        { error: 'Direct Message ID is required' },
        { status: 400 }
      );
    }

    // Notify the AI orchestration service about the DM deletion
    try {
      const { aiOrchestrationService } = await import('@/services/ai-orchestration.service');
      aiOrchestrationService.stopListeningToDM(directMessageId);
    } catch (error) {
      console.error('Failed to stop DM listener:', error);
      // Don't fail the request if listener cleanup fails
    }

    await db.deleteDirectMessage(directMessageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete direct message:', error);
    return NextResponse.json(
      { error: 'Failed to delete direct message' },
      { status: 500 }
    );
  }
}
