import { prisma } from '@/lib/prisma';
import TeacherDashboard from './TeacherDashboard';

export const dynamic = 'force-dynamic';

export default async function TeacherPage() {
  const teams = await prisma.team.findMany({
    include: {
      teacherVote: true,
      votes: {
        include: {
          student: true
        }
      }
    }
  });

  const formattedTeams = teams.map(t => ({
    id: t.id,
    name: t.name,
    grade: t.grade,
    song: t.song,
    contentScore: t.teacherVote?.contentScore || 0,
    accuracyScore: t.teacherVote?.accuracyScore || 0,
    votesDetails: t.votes.map(v => ({
      studentName: v.student.name,
      scienceScore: v.scienceScore,
      bangerScore: v.bangerScore,
    })).sort((a, b) => a.studentName.localeCompare(b.studentName))
  })).sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));

  const allStudents = await prisma.student.findMany({
    include: { team: true },
    orderBy: [
      { grade: 'asc' },
      { team: { name: 'asc' } },
      { name: 'asc' }
    ]
  });

  const roster = allStudents.map(s => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    teamId: s.teamId,
    teamName: s.team?.name || 'Unassigned',
    isCaptain: s.isCaptain,
    hasVoted: s.hasVoted,
    pin: s.pin
  }));

  const simpleTeams = teams.map(t => ({
    id: t.id,
    name: t.name,
    grade: t.grade
  }));

  return <TeacherDashboard initialTeams={formattedTeams} roster={roster} simpleTeams={simpleTeams} />;
}
