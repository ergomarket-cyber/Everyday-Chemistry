import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 });
    }

    // Is it teacher?
    if (name === 'TEACHER' && pin === 'CHEM2026') { // simple teacher login
      return NextResponse.json({ 
        user: { name: 'Teacher', role: 'teacher' } 
      });
    }

    const student = await prisma.student.findFirst({
      where: { name, pin },
      include: { team: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Invalid name or PIN' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: { 
        id: student.id, 
        name: student.name, 
        grade: student.grade, 
        teamId: student.teamId,
        hasVoted: student.hasVoted,
        isCaptain: student.isCaptain
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
