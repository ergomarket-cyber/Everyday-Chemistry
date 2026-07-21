import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

function extractDriveId(url: string): string | null {
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

async function fetchPdfAsBase64(inputUrl: string): Promise<string> {
  const trimmed = inputUrl.trim();
  const driveId = extractDriveId(trimmed);
  
  let downloadUrl: string;
  if (driveId) {
    downloadUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${driveId}`;
  } else {
    try {
      new URL(trimmed);
      downloadUrl = trimmed;
    } catch {
      throw new Error(`Invalid URL provided: "${trimmed.substring(0, 50)}...". Please use a Google Drive sharing link.`);
    }
  }

  const res = await fetch(downloadUrl, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to download PDF (HTTP ${res.status}). Make sure the link is public.`);
  }
  
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
    if (driveId) {
      const altUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`;
      const altRes = await fetch(altUrl, { redirect: 'follow' });
      if (altRes.ok) {
        const buffer = await altRes.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      }
    }
  }
  
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const { paperUrl, markschemeUrl } = await req.json();

    if (!paperUrl || !markschemeUrl) {
      return NextResponse.json({ error: 'Both URLs are required.' }, { status: 400 });
    }

    const [paperBase64, markschemeBase64] = await Promise.all([
      fetchPdfAsBase64(paperUrl),
      fetchPdfAsBase64(markschemeUrl),
    ]);

    const topics = await prisma.topic.findMany({ include: { subtopics: true } });
    const contextStr = topics.map(t =>
      `Topic: ${t.name}\nSubtopics:\n` + t.subtopics.map(st => ` - ID: ${st.id} | Name: ${st.name}`).join('\n')
    ).join('\n\n');

    return NextResponse.json({ 
      paperBase64, 
      markschemeBase64, 
      contextStr,
      apiKey: process.env.GEMINI_API_KEY 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
