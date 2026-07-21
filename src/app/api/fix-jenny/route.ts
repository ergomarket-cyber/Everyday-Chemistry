import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const jennyName = "Jenny @ Thu Thu Han";
  
  const jenny = await prisma.student.findFirst({ where: { name: jennyName } });
  if (!jenny) {
    return NextResponse.json({ error: "Jenny not found" });
  }
  
  await prisma.student.update({
    where: { id: jenny.id },
    data: { teamId: "11_2", isCaptain: true }
  });
  
  const otherCaptains = await prisma.student.findMany({
    where: { teamId: "11_2", isCaptain: true, id: { not: jenny.id } }
  });
  
  for (const cap of otherCaptains) {
    await prisma.student.update({
      where: { id: cap.id },
      data: { isCaptain: false, teamId: null }
    });
  }

  return NextResponse.json({ success: true, message: "Jenny is now captain of team 11_2" });
}
