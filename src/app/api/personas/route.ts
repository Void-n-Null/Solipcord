import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, description, imageUrl, isFriendOfUser = true } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const persona = await db.createPersona({
      username: username.trim(),
      description: description?.trim() || undefined,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { personaId, headerColor } = body;

    if (!personaId || typeof personaId !== 'string') {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    if (!headerColor || typeof headerColor !== 'string') {
      return NextResponse.json(
        { error: 'Header color is required' },
        { status: 400 }
      );
    }

    const updatedPersona = await db.updatePersonaHeaderColor(personaId, headerColor);
    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error('Failed to update persona header color:', error);
    return NextResponse.json(
      { error: 'Failed to update persona header color' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { personaId, action } = body;

    if (!personaId || typeof personaId !== 'string') {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    if (action === 'unfriend') {
      // Remove persona from user's friends list
      await db.removePersonaFromUserFriends(personaId);
      return NextResponse.json({ success: true, message: 'Persona unfriended' });
    } else if (action === 'erase') {
      // Delete persona completely from database
      await db.deletePersona(personaId);
      return NextResponse.json({ success: true, message: 'Persona erased' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "unfriend" or "erase"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to modify persona:', error);
    return NextResponse.json(
      { error: 'Failed to modify persona' },
      { status: 500 }
    );
  }
}
