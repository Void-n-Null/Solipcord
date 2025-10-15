import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const updatedCount = await db.ensurePersonaHeaderColors();
    
    return NextResponse.json({
      message: `Updated ${updatedCount} personas with header colors`,
      updatedCount,
    });
  } catch (error) {
    console.error('Failed to ensure persona header colors:', error);
    return NextResponse.json(
      { error: 'Failed to ensure persona header colors' },
      { status: 500 }
    );
  }
}
