import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { studentId, votes } = await request.json(); // votes = { [teamId]: { science: number, banger: number } }

    if (!studentId || !votes) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (student.hasVoted) return NextResponse.json({ error: 'Already voted' }, { status: 403 });

    // Save votes
    const votePromises = Object.entries(votes).map(([teamId, scores]: [string, any]) => {
      // Prevent self-voting just in case
      if (teamId === student.teamId) return null;
      if (!scores.science && !scores.banger) return null; // No score given

      return prisma.vote.create({
        data: {
          studentId,
          teamId,
          scienceScore: scores.science || 0,
          bangerScore: scores.banger || 0,
        }
      });
    }).filter(Boolean);

    await Promise.all(votePromises as any);

    // Mark as voted
    await prisma.student.update({
      where: { id: studentId },
      data: { hasVoted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
