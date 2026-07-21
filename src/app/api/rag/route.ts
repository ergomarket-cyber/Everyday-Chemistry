import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
  }

  try {
    const attempts = await prisma.studentAttempt.findMany({
      where: { studentId },
      include: {
        question: true
      }
    });

    // Aggregate by subtopicId
    const subtopicScores: Record<string, { totalScore: number, totalMax: number }> = {};

    for (const attempt of attempts) {
      const stId = attempt.question.subtopicId;
      if (!subtopicScores[stId]) {
        subtopicScores[stId] = { totalScore: 0, totalMax: 0 };
      }
      subtopicScores[stId].totalScore += attempt.aiScore;
      subtopicScores[stId].totalMax += attempt.question.maxMarks;
    }

    const ragStatus: Record<string, 'GREEN' | 'AMBER' | 'RED' | 'GREY'> = {};

    for (const stId in subtopicScores) {
      const { totalScore, totalMax } = subtopicScores[stId];
      if (totalMax === 0) continue;
      
      const percentage = (totalScore / totalMax) * 100;
      
      if (percentage >= 85) {
        ragStatus[stId] = 'GREEN';
      } else if (percentage >= 50) {
        ragStatus[stId] = 'AMBER';
      } else {
        ragStatus[stId] = 'RED';
      }
    }

    return NextResponse.json({ ragStatus });
  } catch (error) {
    console.error('RAG Error:', error);
    return NextResponse.json({ error: 'Failed to fetch RAG status' }, { status: 500 });
  }
}
