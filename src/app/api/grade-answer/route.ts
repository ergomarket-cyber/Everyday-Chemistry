import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Allow max 60 seconds on Vercel Hobby tier

export async function POST(request: Request) {
  try {
    const { studentId, questionId, studentAnswer } = await request.json();

    if (!studentId || !questionId || !studentAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured on the server' }, { status: 500 });
    }

    // Fetch the question
    const question = await prisma.examQuestion.findUnique({
      where: { id: questionId },
      include: { subtopic: true }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Initialize the new Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert Cambridge/Edexcel IGCSE Chemistry examiner.
You need to grade a student's answer strictly according to the official Mark Scheme.
Max Marks: ${question.maxMarks}

Question:
${question.questionText}

Official Mark Scheme:
${question.markSchemeText}

Student's Answer:
${studentAnswer}

Instructions:
1. Grade the student's answer out of ${question.maxMarks}.
2. Explain exactly where they earned marks and where they lost marks.
3. Keep feedback encouraging but strictly objective regarding the mark scheme rules.
4. Output your response as a valid JSON object matching exactly this structure:
{
  "score": <integer score from 0 to ${question.maxMarks}>,
  "feedback": "<string explanation of the grading>"
}
Do not include any markdown formatting around the JSON (e.g., no \`\`\`json). Just return the raw JSON object.
`;

    let result;
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        break;
      } catch (error: any) {
        retries--;
        console.warn(`Gemini API Error in grading. Retries left: ${retries}`, error?.message);
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    
    const responseText = result?.text || "";
    
    // Parse JSON
    let parsedResponse;
    try {
      const cleanJson = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      parsedResponse = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 });
    }

    const { score, feedback } = parsedResponse;

    // Save attempt to database
    const attempt = await prisma.studentAttempt.create({
      data: {
        studentId,
        questionId,
        studentAnswer,
        aiScore: Math.min(Math.max(score, 0), question.maxMarks), // clamp
        aiFeedback: feedback
      }
    });

    return NextResponse.json({ attempt });

  } catch (error: any) {
    console.error('Grade Answer Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
