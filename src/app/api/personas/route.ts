import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, imageUrl, isFriendOfUser = true } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const persona = await db.createPersona({
      username: username.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      isFriendOfUser,
      friendsIds: [],
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error) {
    console.error('Failed to create persona:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const personas = await db.getAllPersonas();
    return NextResponse.json(personas);
  } catch (error) {
    console.error('Failed to fetch personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}
