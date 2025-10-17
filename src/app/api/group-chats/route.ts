import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantIds } = body;

    // Validate input
    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: 'participantIds must be an array' },
        { status: 400 }
      );
    }

    if (participantIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one participant is required' },
        { status: 400 }
      );
    }

    if (participantIds.length > 9) {
      return NextResponse.json(
        { error: 'Maximum 9 participants allowed' },
        { status: 400 }
      );
    }

    // Check that all IDs are strings
    if (!participantIds.every((id: unknown) => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All participant IDs must be strings' },
        { status: 400 }
      );
    }

    const groupChat = await db.createGroupChat(participantIds);
    
    // Notify the AI orchestration service about the new group chat
    try {
      const { aiOrchestrationService } = await import('@/services/ai-orchestration.service');
      await aiOrchestrationService.addGroupListener(groupChat.id);
    } catch (error) {
      console.error('Failed to add group listener:', error);
      // Don't fail the request if listener setup fails
    }
    
    return NextResponse.json(groupChat, { status: 201 });
  } catch (error) {
    console.error('Failed to create group chat:', error);
    
    if (error instanceof Error) {
      // Return validation errors
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const groupChats = await db.getAllGroups();
    return NextResponse.json(groupChats);
  } catch (error) {
    console.error('Failed to fetch group chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group chats' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Notify the AI orchestration service about the group deletion
    try {
      const { aiOrchestrationService } = await import('@/services/ai-orchestration.service');
      aiOrchestrationService.stopListeningToGroup(groupId);
    } catch (error) {
      console.error('Failed to stop group listener:', error);
      // Don't fail the request if listener cleanup fails
    }

    await db.deleteGroup(groupId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete group chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete group chat' },
      { status: 500 }
    );
  }
}

