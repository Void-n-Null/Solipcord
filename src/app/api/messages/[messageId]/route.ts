import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Delete the message
    const deletedMessage = await db.deleteMessage(messageId);

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
