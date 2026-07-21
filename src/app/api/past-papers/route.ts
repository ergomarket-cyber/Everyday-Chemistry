import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const papers = await prisma.pastPaper.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { reference: 'asc' }
      ]
    });
    return NextResponse.json(papers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { year, month, reference } = await req.json();

    if (!year || !month || !reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paper = await prisma.pastPaper.create({
      data: {
        year: parseInt(year, 10),
        month,
        reference
      }
    });

    return NextResponse.json(paper);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
