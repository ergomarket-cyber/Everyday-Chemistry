import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({ include: { subtopics: true } });
    const contextStr = topics.map(t =>
      `Topic: ${t.name}\nSubtopics:\n` + t.subtopics.map(st => ` - ID: ${st.id} | Name: ${st.name}`).join('\n')
    ).join('\n\n');

    return NextResponse.json({ 
      contextStr,
      apiKey: process.env.GEMINI_API_KEY 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
