import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        votes: true,
        teacherVote: true
      }
    });

    const results = teams.map(team => {
      const studentVotes = team.votes;
      const numVotes = studentVotes.length;
      
      let avgScience = 0;
      let avgBanger = 0;

      if (numVotes > 0) {
        avgScience = studentVotes.reduce((acc, v) => acc + v.scienceScore, 0) / numVotes;
        avgBanger = studentVotes.reduce((acc, v) => acc + v.bangerScore, 0) / numVotes;
      }

      const teacherContent = team.teacherVote?.contentScore || 0;
      const teacherAccuracy = team.teacherVote?.accuracyScore || 0;

      const totalScore = avgScience + avgBanger + teacherContent + teacherAccuracy;

      return {
        id: team.id,
        name: team.name,
        grade: team.grade,
        song: team.song,
        avgScience: avgScience.toFixed(1),
        avgBanger: avgBanger.toFixed(1),
        teacherContent,
        teacherAccuracy,
        totalScore: totalScore.toFixed(1),
        votesCount: numVotes
      };
    });

    // Sort by total score descending
    results.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
