import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids must be a non-empty array' },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 personas per request' },
        { status: 400 }
      );
    }

    // Validate all IDs are strings
    if (!ids.every(id => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All ids must be strings' },
        { status: 400 }
      );
    }

    const personas = await Promise.all(
      ids.map(id => db.getPersonaById(id))
    );

    // Filter out null values
    const validPersonas = personas.filter(p => p !== null);

    return NextResponse.json(validPersonas);
  } catch (error) {
    console.error('Failed to fetch personas batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}
