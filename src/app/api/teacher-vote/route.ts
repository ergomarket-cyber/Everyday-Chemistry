import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { teamId, contentScore, accuracyScore } = await request.json();

    if (!teamId || contentScore === undefined || accuracyScore === undefined) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await prisma.teacherVote.upsert({
      where: { teamId },
      update: { contentScore, accuracyScore },
      create: { teamId, contentScore, accuracyScore }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Teacher vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
