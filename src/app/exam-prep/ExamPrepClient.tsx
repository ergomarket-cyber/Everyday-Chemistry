'use client';

import React, { useState, useEffect } from 'react';
import { User, LogOut, CheckCircle2, ChevronRight, BrainCircuit, ArrowLeft, Send, PlayCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginScreen({ students10, students11, onLogin }: any) {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = async () => {
    if (selectedGrade && selectedName && pin) {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: selectedName, pin })
        });
        const data = await res.json();
        
        if (res.ok) {
          onLogin(data.user);
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const studentOptions = selectedGrade === 10 ? students10 : students11;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 mb-4 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <BrainCircuit className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">AI Exam Prep</h1>
          <p className="text-slate-400 font-medium">Log in to practice past papers</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex gap-2">
            <button onClick={() => { setSelectedGrade(10); setSelectedName(""); }} className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${selectedGrade === 10 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Grade 10</button>
            <button onClick={() => { setSelectedGrade(11); setSelectedName(""); }} className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${selectedGrade === 11 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Grade 11</button>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${selectedGrade ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">Select Name</label>
            <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-colors appearance-none font-medium">
              <option value="">Choose...</option>
              {studentOptions?.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${selectedName ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">4-Digit PIN</label>
            <input type="password" pattern="[0-9]*" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 text-center tracking-[1em] font-mono text-xl transition-colors" />
          </div>

          {error && <p className="text-rose-500 text-sm font-bold text-center bg-rose-500/10 py-2 rounded-lg">{error}</p>}

          <button onClick={handleEnter} disabled={!selectedName || pin.length < 4 || isLoading} className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${selectedName && pin.length >= 4 && !isLoading ? 'bg-blue-600 text-white hover:scale-[1.02] shadow-lg shadow-blue-500/25' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
            {isLoading ? 'Checking...' : 'Enter Platform'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamPrepClient({ topics, students10, students11 }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ragStatus, setRagStatus] = useState<Record<string, string>>({});
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Fetch RAG status when user logs in
  const fetchRag = async (user: any) => {
    try {
      const res = await fetch(`/api/rag?studentId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRagStatus(data.ragStatus || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    fetchRag(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedQuestion(null);
    setResult(null);
    setStudentAnswer("");
    setRagStatus({});
  };

  const fetchRandomQuestion = async (subtopic: any) => {
    try {
      const res = await fetch(`/api/question/${subtopic.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedQuestion({ ...data.question, subtopicName: subtopic.name, topicName: subtopic.topicName });
        setResult(null);
        setStudentAnswer("");
      } else {
        alert(data.error || 'Failed to load question');
      }
    } catch (e) {
      alert("Network error fetching question.");
    }
  };

  const handleGrade = async () => {
    if (!studentAnswer.trim()) return;
    setIsGrading(true);
    try {
      const res = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          questionId: selectedQuestion.id,
          studentAnswer
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.attempt);
        // Refresh RAG
        fetchRag(currentUser);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to grade answer.");
    } finally {
      setIsGrading(false);
    }
  };

  if (!currentUser) {
    return <LoginScreen students10={students10} students11={students11} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      <header className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Student</p>
              <p className="text-sm font-bold">{currentUser.name}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Home</Link>
            <button onClick={logout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-blue-400">
            Edexcel 4CH1 Analytics
          </h1>
          <p className="text-slate-400 text-sm font-medium">Click on a subtopic to practice exam questions.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {!selectedQuestion ? (
          <div className="grid gap-8">
            {topics.map((topic: any) => (
              <div key={topic.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                <h2 className="text-2xl font-black mb-6 pl-4 tracking-tight">{topic.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {topic.subtopics.map((st: any) => {
                    const status = ragStatus[st.id] || 'GREY';
                    const hasQuestions = st.questions && st.questions.length > 0;
                    
                    const colorClasses = {
                      'GREEN': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500',
                      'AMBER': 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500',
                      'RED': 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500',
                      'GREY': 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-800/80 hover:border-blue-500/50 hover:text-white',
                    }[status];

                    return (
                      <button 
                        key={st.id}
                        disabled={!hasQuestions}
                        onClick={() => fetchRandomQuestion({ ...st, topicName: topic.name })}
                        className={`group p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[100px] ${colorClasses} ${!hasQuestions ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                      >
                        <span className="font-bold leading-tight line-clamp-2">{st.name}</span>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                            {status === 'GREY' ? 'Not attempted' : status}
                          </span>
                          {hasQuestions && <PlayCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                          {!hasQuestions && <AlertCircle className="w-4 h-4 text-slate-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <button 
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{selectedQuestion.topicName}</p>
                  <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                    {selectedQuestion.subtopicName}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-lg">
                  [{selectedQuestion.maxMarks} marks]
                </span>
              </div>
              <p className="text-lg leading-relaxed text-slate-200">{selectedQuestion.questionText}</p>
            </div>

            {!result ? (
              <div className="space-y-4">
                <textarea 
                  rows={6}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your detailed answer here..."
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 resize-none transition-colors shadow-inner"
                />
                <button 
                  onClick={handleGrade}
                  disabled={isGrading || !studentAnswer.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                  {isGrading ? 'AI is grading...' : <><Send className="w-5 h-5" /> Submit Answer</>}
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  AI Feedback
                </h3>
                
                <div className="flex items-end gap-3 mb-6 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <span className="text-4xl font-black text-emerald-400">{result.aiScore}</span>
                  <span className="text-lg font-medium text-emerald-500/70 mb-1">/ {selectedQuestion.maxMarks} marks</span>
                </div>

                <div className="prose prose-invert prose-emerald max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.aiFeedback}</p>
                </div>

                <button 
                  onClick={() => { setSelectedQuestion(null); setResult(null); setStudentAnswer(""); }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-colors mt-6"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
