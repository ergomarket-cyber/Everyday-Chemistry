import { prisma } from '@/lib/prisma';
import Arena from './Arena';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const teams = await prisma.team.findMany({
    include: {
      students: true,
    }
  });

  const students = await prisma.student.findMany({
    select: {
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
    members: t.students.map(s => s.name)
  }));

  const students10 = students.filter(s => s.grade === 10).map(s => s.name).sort((a, b) => a.localeCompare(b));
  const students11 = students.filter(s => s.grade === 11).map(s => s.name).sort((a, b) => a.localeCompare(b));

  return (
    <Arena 
      initialTeams={formattedTeams} 
      students10={students10} 
      students11={students11} 
    />
  );
}
