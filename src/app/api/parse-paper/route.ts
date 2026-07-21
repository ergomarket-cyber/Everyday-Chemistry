import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60; // Allow max 60 seconds on Vercel Hobby tier

// Initialize the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const paperFile = formData.get('paper') as File | null;
    const markschemeFile = formData.get('markscheme') as File | null;

    if (!paperFile || !markschemeFile) {
      return NextResponse.json({ error: 'Both paper and markscheme PDFs are required.' }, { status: 400 });
    }

    // Convert files to base64
    const paperBuffer = Buffer.from(await paperFile.arrayBuffer());
    const markschemeBuffer = Buffer.from(await markschemeFile.arrayBuffer());
    
    const paperBase64 = paperBuffer.toString('base64');
    const markschemeBase64 = markschemeBuffer.toString('base64');

    // Fetch all topics and subtopics for context
    const topics = await prisma.topic.findMany({
      include: { subtopics: true }
    });

    const contextStr = topics.map(t => 
      `Topic: ${t.name}\nSubtopics:\n` + t.subtopics.map(st => ` - ID: ${st.id} | Name: ${st.name}`).join('\n')
    ).join('\n\n');

    const prompt = `
You are an expert Chemistry examiner for Edexcel IGCSE 4CH1.
I have provided two PDF documents: an Exam Paper and its corresponding Mark Scheme.

Your task is to parse both documents, match every single question with its corresponding answer in the mark scheme, and output a strict JSON array.

Please extract the following for each question (e.g., 1a, 1b, 1c(i), etc.):
- "questionText": The exact text of the question.
- "markSchemeText": The exact acceptable answers and rules from the mark scheme for this specific question.
- "maxMarks": An integer representing the maximum marks available for this question.
- "suggestedSubtopicId": The ID of the subtopic that best matches this question, chosen ONLY from the list below. If you cannot decide, leave it empty string.

Here is the list of valid Topics and Subtopics:
${contextStr}

Respond ONLY with a valid JSON array of objects. Do not include markdown code blocks like \`\`\`json or any conversational text. Just the raw JSON array.
Format example:
[
  {
    "questionText": "State the meaning of the term atomic number.",
    "markSchemeText": "number of protons (in the nucleus)",
    "maxMarks": 1,
    "suggestedSubtopicId": "uuid-here"
  }
]
`;

    let result;
    let retries = 3;
    let delay = 2000; // 2 seconds

    while (retries > 0) {
      try {
        result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: paperBase64
              }
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: markschemeBase64
              }
            },
            prompt
          ],
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        console.warn(`Gemini API Error. Retries left: ${retries}`, error?.message);
        if (retries === 0) {
          throw error; // Throw on last failure
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    let text = result?.text || '';
    
    // Clean up potential markdown formatting
    if (text.startsWith('```json')) text = text.substring(7);
    if (text.startsWith('```')) text = text.substring(3);
    if (text.endsWith('```')) text = text.substring(0, text.length - 3);
    text = text.trim();

    const questions = JSON.parse(text);

    return NextResponse.json({ questions });

  } catch (error: any) {
    console.error('Error parsing papers:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
