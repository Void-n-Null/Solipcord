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
