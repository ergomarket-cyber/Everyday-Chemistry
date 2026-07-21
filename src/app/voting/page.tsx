import { prisma } from '@/lib/prisma';
import Arena from './Arena';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const teams = await prisma.team.findMany({
    include: {
      members: true,
    }
  });

  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      grade: true,
      teamId: true
    }
  });

  // Map data to match the UI component expected structure
  const formattedTeams = teams.map(t => ({
    id: t.id,
    grade: t.grade,
    name: t.name,
    song: t.song,
    topic: t.topic,
    color: t.color,
    avatar: t.avatar,
    lyrics: t.lyrics,
    audioUrl: t.audioUrl,
    isRosterLocked: t.isRosterLocked,
    members: t.members.map((s: any) => s.name)
  }));

  const students10 = students.filter(s => s.grade === 10).sort((a, b) => a.name.localeCompare(b.name));
  const students11 = students.filter(s => s.grade === 11).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Arena 
      initialTeams={formattedTeams} 
      students10={students10} 
      students11={students11} 
    />
  );
}
