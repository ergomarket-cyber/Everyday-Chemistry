import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Users, BrainCircuit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeacherAnalyticsPage() {
  const topics = await prisma.topic.findMany({
    include: {
      subtopics: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  const attempts = await prisma.studentAttempt.findMany({
    include: {
      question: {
        include: {
          subtopic: {
            include: {
              topic: true
            }
          }
        }
      },
      student: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate Class-wide RAG
  const subtopicScores: Record<string, { totalScore: number, totalMax: number, name: string, topicName: string }> = {};

  for (const attempt of attempts) {
    const stId = attempt.question.subtopicId;
    if (!subtopicScores[stId]) {
      subtopicScores[stId] = { 
        totalScore: 0, 
        totalMax: 0, 
        name: attempt.question.subtopic.name,
        topicName: attempt.question.subtopic.topic.name
      };
    }
    subtopicScores[stId].totalScore += attempt.aiScore;
    subtopicScores[stId].totalMax += attempt.question.maxMarks;
  }

  const ragStats = Object.values(subtopicScores).map(st => {
    const percentage = (st.totalScore / st.totalMax) * 100;
    let status = 'RED';
    if (percentage >= 85) status = 'GREEN';
    else if (percentage >= 50) status = 'AMBER';

    return {
      ...st,
      percentage: Math.round(percentage),
      status
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      <header className="pt-8 pb-6 px-4 border-b border-white/10 bg-slate-900/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teacher" className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-emerald-400">Class Analytics</h1>
              <p className="text-slate-400 text-sm">RAG Status & Recent AI Interventions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid md:grid-cols-2 gap-8">
        {/* Left Column: Heatmap */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Class-wide Topic Mastery
          </h2>
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl">
            {ragStats.length === 0 ? (
              <p className="text-slate-500 italic">No student attempts recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {ragStats.map((st, i) => {
                  const colorClasses = {
                    'GREEN': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    'AMBER': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    'RED': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                  }[st.status];

                  return (
                    <div key={i} className={`p-4 border rounded-2xl flex justify-between items-center ${colorClasses}`}>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{st.topicName}</p>
                        <p className="font-bold">{st.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black">{st.percentage}%</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest">{st.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            Recent AI Interventions
          </h2>
          <div className="space-y-4">
            {attempts.map(attempt => (
              <div key={attempt.id} className="bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${attempt.aiScore === attempt.question.maxMarks ? 'bg-emerald-500' : attempt.aiScore > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-bold text-blue-400 mr-2">{attempt.student.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{attempt.question.subtopic.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${attempt.aiScore === attempt.question.maxMarks ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {attempt.aiScore} / {attempt.question.maxMarks}
                  </span>
                </div>
                <div className="text-sm space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-500">Answer: </span>
                    <span className="text-slate-300">{attempt.studentAnswer}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-bold uppercase text-purple-400 block mb-1">AI Feedback:</span>
                    <span className="text-slate-400 italic leading-relaxed">{attempt.aiFeedback}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
