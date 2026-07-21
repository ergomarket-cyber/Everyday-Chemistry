import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60; // Allow max 60 seconds on Vercel Hobby tier

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Convert a Google Drive share URL to a direct download URL
function toDirectUrl(url: string): string {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}

async function fetchPdfAsBase64(url: string): Promise<string> {
  const directUrl = toDirectUrl(url);
  const res = await fetch(directUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download PDF from URL: ${res.status} ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paperUrl, markschemeUrl } = body;

    if (!paperUrl || !markschemeUrl) {
      return NextResponse.json({ error: 'Both paperUrl and markschemeUrl are required.' }, { status: 400 });
    }

    // Download PDFs from URLs and convert to base64
    const [paperBase64, markschemeBase64] = await Promise.all([
      fetchPdfAsBase64(paperUrl),
      fetchPdfAsBase64(markschemeUrl),
    ]);

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

    const result = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: paperBase64 } },
            { inlineData: { mimeType: 'application/pdf', data: markschemeBase64 } },
            { text: prompt }
          ]
        }
      ],
    });

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
