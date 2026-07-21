import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { teamId, studentIds, captainId } = await request.json();

    if (!teamId || !studentIds || !Array.isArray(studentIds) || !captainId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (studentIds.length > 7) {
      return NextResponse.json({ error: 'Cannot recruit more than 7 members at once' }, { status: 400 });
    }

    // Verify captain and team lock status
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.isRosterLocked) {
      return NextResponse.json({ error: 'Team roster is already locked' }, { status: 403 });
    }

    const captain = team.members.find(m => m.id === captainId);
    if (!captain || !captain.isCaptain) {
      return NextResponse.json({ error: 'Only the team captain can recruit members' }, { status: 403 });
    }

    // Assign students to the team
    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        teamId: null, // Ensure they are unassigned
        grade: team.grade // Ensure they are in the same grade
      },
      data: {
        teamId: team.id
      }
    });

    // Lock the roster
    await prisma.team.update({
      where: { id: team.id },
      data: { isRosterLocked: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recruit team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
