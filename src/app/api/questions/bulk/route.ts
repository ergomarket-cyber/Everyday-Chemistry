import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { questions } = await req.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions must be an array.' }, { status: 400 });
    }

    const createdQuestions = await prisma.$transaction(
      questions.map(q => {
        return prisma.examQuestion.create({
          data: {
            questionText: q.questionText,
            questionImgUrl: q.questionImgUrl || null,
            markSchemeText: q.markSchemeText,
            markSchemeImgUrl: q.markSchemeImgUrl || null,
            maxMarks: parseInt(q.maxMarks, 10) || 0,
            subtopicId: q.suggestedSubtopicId,
            paperId: q.paperId || null,
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: createdQuestions.length });

  } catch (error: any) {
    console.error('Error bulk saving questions:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
