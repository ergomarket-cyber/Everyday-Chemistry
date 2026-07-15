import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { teamId, name, topic, avatar, lyrics, audioUrl } = data;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        topic,
        avatar,
        lyrics,
        audioUrl
      }
    });

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
