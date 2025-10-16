import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/message.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const message = await messageService.getMessageById(messageId);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to fetch message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const updatedMessage = await messageService.updateMessage(messageId, { content });
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Failed to update message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const deletedMessage = await messageService.deleteMessage(messageId);
    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.error('Failed to delete message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
