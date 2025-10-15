import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

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

    const message = await db.createMessage({
      content: content.trim(),
      userId,
      personaId,
      groupId,
      directMessageId,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
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

    let messages;
    if (groupId) {
      messages = await db.getMessagesByGroup(groupId, limit);
    } else if (directMessageId) {
      messages = await db.getMessagesByDirectMessage(directMessageId, limit);
    } else {
      return NextResponse.json(
        { error: 'Either groupId or directMessageId is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
