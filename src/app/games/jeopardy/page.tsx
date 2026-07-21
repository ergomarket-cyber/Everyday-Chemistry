'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, X, Check, Image as ImageIcon, Plus, Minus, Crown, Users } from 'lucide-react';
import Link from 'next/link';
import jeopardyData from '@/data/jeopardy.json';
import Image from 'next/image';

type Team = {
  id: number;
  name: string;
  score: number;
  color: string;
  wager: number;
};

export default function JeopardyGame() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team Alpha', score: 0, color: 'text-blue-400', wager: 0 },
    { id: 2, name: 'Team Beta', score: 0, color: 'text-pink-400', wager: 0 },
    { id: 3, name: 'Team Gamma', score: 0, color: 'text-green-400', wager: 0 },
    { id: 4, name: 'Team Delta', score: 0, color: 'text-amber-400', wager: 0 },
  ]);

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [finalPhase, setFinalPhase] = useState<'wager' | 'question' | 'answer'>('wager');

  useEffect(() => {
    let interval: any;
    if (activeQuestion && !showAnswer && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuestion, showAnswer, timer]);

  const handleQuestionClick = (categoryIndex: number, questionIndex: number, q: any) => {
    const key = `${categoryIndex}-${questionIndex}`;
    if (visited.has(key)) return;
    
    setVisited((prev) => new Set(prev).add(key));
    setActiveQuestion({ ...q, key });
    setShowAnswer(false);
    setTimer(30);
  };

  const adjustScore = (teamId: number, amount: number) => {
    setTeams((prev) => prev.map(t => t.id === teamId ? { ...t, score: t.score + amount } : t));
  };

  const updateTeamName = (teamId: number, name: string) => {
    setTeams((prev) => prev.map(t => t.id === teamId ? { ...t, name } : t));
  };

  const updateWager = (teamId: number, wager: string) => {
    setTeams((prev) => prev.map(t => t.id === teamId ? { ...t, wager: parseInt(wager) || 0 } : t));
  };

  const startFinalRound = () => {
    setIsFinalRound(true);
    setFinalPhase('wager');
  };

  const startFinalQuestion = () => {
    setFinalPhase('question');
    setTimer(180); // 3 minutes
    setActiveQuestion(jeopardyData.finalRound);
    setShowAnswer(false);
  };

  const showFinalAnswer = () => {
    setFinalPhase('answer');
    setShowAnswer(true);
  };

  const closeQuestion = () => {
    setActiveQuestion(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 z-0" />
      
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Games
        </Link>
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
          Bonding Jeopardy
        </h1>
        <button 
          onClick={startFinalRound}
          disabled={isFinalRound}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50"
        >
          Final Round
        </button>
      </div>

      {/* Main Board */}
      <div className="relative z-10 flex-1 p-6 flex flex-col items-center justify-center">
        {!isFinalRound ? (
          <div className="w-full max-w-6xl grid grid-cols-4 gap-4">
            {/* Categories */}
            {jeopardyData.categories.map((cat) => (
              <div key={cat.id} className="bg-slate-800/80 border-b-4 border-cyan-500 p-4 text-center rounded-t-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <h2 className="text-xl font-bold uppercase tracking-wide text-cyan-50">{cat.name}</h2>
              </div>
            ))}
            
            {/* Grid */}
            {[0, 1, 2, 3].map((rowIndex) => (
              <React.Fragment key={rowIndex}>
                {jeopardyData.categories.map((cat, catIndex) => {
                  const q = cat.questions[rowIndex];
                  const key = `${catIndex}-${rowIndex}`;
                  const isVisited = visited.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => handleQuestionClick(catIndex, rowIndex, q)}
                      disabled={isVisited}
                      className={`h-24 sm:h-32 rounded-xl text-3xl sm:text-5xl font-black flex items-center justify-center transition-all duration-300 border-2 
                        ${isVisited 
                          ? 'bg-slate-900/50 border-slate-800 text-slate-700' 
                          : 'bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105'
                        }`}
                    >
                      {isVisited ? '' : q.points}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-4xl text-center space-y-8">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 uppercase tracking-widest animate-pulse">
              {jeopardyData.finalRound.title}
            </h2>
            
            {finalPhase === 'wager' && (
              <div className="bg-slate-900/80 p-8 rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <h3 className="text-2xl font-bold mb-8">Enter Secret Wagers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                  {teams.map(team => (
                    <div key={team.id} className="space-y-3 text-left">
                      <label className={`font-bold ${team.color}`}>{team.name}</label>
                      <input 
                        type="number" 
                        value={team.wager}
                        onChange={(e) => updateWager(team.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={startFinalQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-bold text-xl hover:scale-105 transition-transform"
                >
                  Start Final Countdown
                </button>
              </div>
            )}
            
            {finalPhase !== 'wager' && (
              <div className="bg-slate-900/90 border-2 border-amber-500/50 p-8 sm:p-12 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                <p className="text-3xl sm:text-4xl font-medium leading-tight mb-12">
                  {jeopardyData.finalRound.question}
                </p>
                
                {!showAnswer ? (
                  <div className="space-y-8">
                    <div className="text-7xl font-mono font-bold text-amber-400">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                    <button 
                      onClick={showFinalAnswer}
                      className="px-8 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-full font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors"
                    >
                      Reveal Answer Early
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-amber-500/50 mb-8 shadow-2xl">
                      <Image 
                        src={jeopardyData.finalRound.imageUrl} 
                        alt="Final Answer"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left space-y-4">
                      {jeopardyData.finalRound.answers.map((ans, idx) => (
                        <p key={idx} className="text-xl font-bold text-amber-50">{ans}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Team Panel (Bottom Sticky) */}
      <div className="relative z-20 border-t border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
              <input 
                type="text" 
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className={`w-full bg-transparent text-center font-bold text-lg mb-2 focus:outline-none border-b border-transparent focus:border-slate-700 pb-1 ${team.color}`}
              />
              <div className="text-4xl font-black tabular-nums tracking-tighter mb-4">
                {team.score}
              </div>
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => adjustScore(team.id, isFinalRound ? -team.wager : -(activeQuestion?.points || 100))}
                  className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg py-2 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => adjustScore(team.id, isFinalRound ? team.wager : (activeQuestion?.points || 100))}
                  className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg py-2 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Modal */}
      {activeQuestion && !isFinalRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-5xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="text-cyan-400 font-bold tracking-widest">{activeQuestion.points} POINTS</div>
              <button onClick={closeQuestion} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-8 sm:p-12 flex-1 overflow-y-auto flex flex-col">
              {!showAnswer ? (
                <div className="flex flex-col items-center justify-center h-full space-y-12">
                  <h2 className="text-4xl sm:text-5xl font-medium text-center leading-tight">
                    {activeQuestion.question}
                  </h2>
                  
                  {/* Timer */}
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                      <span>TIME REMAINING</span>
                      <span className={timer <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}>{timer}s</span>
                    </div>
                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 linear ${timer <= 5 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${(timer / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className={`px-8 py-3 rounded-full font-bold transition-colors ${timer === 0 ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {timer === 0 ? "Show Answer" : "Reveal Answer Early"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-10 duration-500">
                  {activeQuestion.imageUrl ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-8 shadow-2xl flex-shrink-0">
                      <Image 
                        src={activeQuestion.imageUrl} 
                        alt="Answer visualization"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-2xl sm:text-3xl font-bold text-white leading-relaxed">
                          {activeQuestion.answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 flex items-center justify-center p-8 bg-slate-800/50 rounded-xl mb-8 border border-white/10">
                      <p className="text-3xl sm:text-5xl font-bold text-white text-center leading-relaxed">
                        {activeQuestion.answer}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-auto pb-4">
                    <button 
                      onClick={closeQuestion}
                      className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full font-black text-lg transition-colors flex items-center"
                    >
                      <Check className="w-6 h-6 mr-2" />
                      Complete Question
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
}
