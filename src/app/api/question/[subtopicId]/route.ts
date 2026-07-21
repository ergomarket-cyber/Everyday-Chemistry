import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ subtopicId: string }> }) {
  try {
    const { subtopicId } = await context.params;
    const questions = await prisma.examQuestion.findMany({
      where: { subtopicId }
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this subtopic' }, { status: 404 });
    }

    // Pick a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json({ question: randomQuestion });
  } catch (error) {
    console.error('Fetch question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
