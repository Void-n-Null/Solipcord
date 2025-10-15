import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const friends = await db.getFriendPersonas();
    return NextResponse.json(friends);
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}
