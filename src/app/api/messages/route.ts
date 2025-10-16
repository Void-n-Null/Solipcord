import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/message.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId, personaId, groupId, directMessageId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const message = await messageService.createMessage({
      content,
      userId,
      personaId,
      groupId,
      directMessageId,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const directMessageId = searchParams.get('directMessageId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let messages;
    if (groupId) {
      messages = await messageService.getMessagesByGroupId(groupId, { limit, offset });
    } else if (directMessageId) {
      messages = await messageService.getMessagesByDirectMessageId(directMessageId, { limit, offset });
    } else {
      return NextResponse.json(
        { error: 'Either groupId or directMessageId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
