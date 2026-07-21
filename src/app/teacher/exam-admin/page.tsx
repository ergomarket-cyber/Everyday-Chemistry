import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ExamParser from './ExamParser';

export const dynamic = 'force-dynamic';

export default async function ExamAdminPage() {
  const topics = await prisma.topic.findMany({
    include: { subtopics: true }
  });

  const questions = await prisma.examQuestion.findMany({
    include: {
      subtopic: {
        include: {
          topic: true
        }
      },
      attempts: {
        include: {
          student: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-emerald-400">Exam Admin Dashboard</h1>
          <Link href="/teacher" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
            Back to Teacher Hub
          </Link>
        </div>

        <ExamParser topics={topics} />


        <div className="grid gap-6">
          {questions.map(q => (
            <div key={q.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider">
                  {q.subtopic?.topic.name} &gt; {q.subtopic?.name}
                </span>
                <span className="text-slate-400 text-sm font-bold bg-white/5 px-3 py-1 rounded-lg">
                  Max: {q.maxMarks} marks
                </span>
              </div>
              <p className="text-lg mb-4 text-slate-200">{q.questionText}</p>
              
              <div className="bg-black/30 p-4 rounded-xl mb-6">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Mark Scheme</p>
                <p className="text-sm text-emerald-500/80 whitespace-pre-wrap">{q.markSchemeText}</p>
              </div>

              <h3 className="text-lg font-bold mb-4">Student Attempts ({q.attempts.length})</h3>
              
              {q.attempts.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No attempts yet.</p>
              ) : (
                <div className="space-y-4">
                  {q.attempts.map((attempt) => (
                    <div key={attempt.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-blue-400">{attempt.student.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${attempt.aiScore === q.maxMarks ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {attempt.aiScore} / {q.maxMarks}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Student Answer</p>
                          <p className="text-slate-300">{attempt.studentAnswer}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">AI Feedback</p>
                          <p className="text-slate-400 italic">{attempt.aiFeedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
