import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Extract Google Drive file ID from any share/view URL format
function extractDriveId(url: string): string | null {
  // Format 1: /file/d/{id}/
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  // Format 2: id={id}
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

async function fetchPdfAsBase64(inputUrl: string): Promise<string> {
  const trimmed = inputUrl.trim();
  
  // Try to extract Google Drive ID
  const driveId = extractDriveId(trimmed);
  
  let downloadUrl: string;
  if (driveId) {
    // Use export=download which works for most files
    downloadUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${driveId}`;
  } else {
    // Try the URL as-is - validate it first
    try {
      new URL(trimmed);
      downloadUrl = trimmed;
    } catch {
      throw new Error(`Invalid URL provided: "${trimmed.substring(0, 50)}...". Please use a Google Drive sharing link.`);
    }
  }

  console.log('Downloading PDF from:', downloadUrl);
  
  const res = await fetch(downloadUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ChemBeats/1.0)',
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to download PDF (HTTP ${res.status}). Make sure the Google Drive link is public ("Anyone with the link").`);
  }
  
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
    // Google Drive might redirect to HTML virus scan page
    if (driveId) {
      // Try alternative download URL
      const altUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
      console.log('Trying alternative URL:', altUrl);
      const altRes = await fetch(altUrl, { redirect: 'follow' });
      if (altRes.ok) {
        const altContentType = altRes.headers.get('content-type') || '';
        if (altContentType.includes('pdf') || altContentType.includes('octet-stream')) {
          const buffer = await altRes.arrayBuffer();
          return Buffer.from(buffer).toString('base64');
        }
      }
    }
    console.warn('Unexpected content-type:', contentType, '- proceeding anyway');
  }
  
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error('Downloaded file is empty. Check Google Drive permissions.');
  }
  
  return Buffer.from(buffer).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paperUrl, markschemeUrl } = body;

    if (!paperUrl || !markschemeUrl) {
      return NextResponse.json({ error: 'Both paperUrl and markschemeUrl are required.' }, { status: 400 });
    }

    // Download PDFs
    let paperBase64: string, markschemeBase64: string;
    try {
      [paperBase64, markschemeBase64] = await Promise.all([
        fetchPdfAsBase64(paperUrl),
        fetchPdfAsBase64(markschemeUrl),
      ]);
    } catch (downloadError: any) {
      return NextResponse.json({ error: downloadError.message }, { status: 400 });
    }

    const topics = await prisma.topic.findMany({ include: { subtopics: true } });

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
