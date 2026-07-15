import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generatePin(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  return (positiveHash % 9000 + 1000).toString(); // 1000-9999
}

export async function POST(request: Request) {
  try {
    const { name, grade, teamId, isCaptain, pin } = await request.json();

    if (!name || !grade || !teamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const finalPin = pin && pin.trim().length === 4 ? pin : generatePin(name);

    const student = await prisma.student.create({
      data: {
        name,
        grade: parseInt(grade),
        teamId,
        isCaptain: Boolean(isCaptain),
        pin: finalPin,
      }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, grade, teamId, isCaptain, pin } = await request.json();

    if (!id || !name || !grade || !teamId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const finalPin = pin && pin.trim().length === 4 ? pin : generatePin(name);

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        grade: parseInt(grade),
        teamId,
        isCaptain: Boolean(isCaptain),
        pin: finalPin,
      }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // First delete all votes cast by this student to satisfy foreign key constraints
    await prisma.vote.deleteMany({
      where: { studentId: id }
    });

    const student = await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
