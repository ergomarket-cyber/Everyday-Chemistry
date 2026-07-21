'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Swords, Shield, Zap, Skull, Flame, Atom, Info, X } from 'lucide-react';
import elementsData from '../../../data/elements.json';
import battleQuestions from '../../../data/battle_questions.json';

type Element = typeof elementsData.elements[0];

type GamePhase = 'setup' | 'battle' | 'results';
type Team = 'blue' | 'red';

type ActionCard = 'Catalyst' | 'Radioactive Decay' | 'Inert Shield';

interface ElementState {
  owner: Team | null;
  lockedUntilTurn?: number;
}

interface TeamState {
  id: Team;
  name: string;
  score: number;
  color: string;
  streak: number;
  cards: ActionCard[];
}

export default function PeriodicTableBattle() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [teams, setTeams] = useState<Record<Team, TeamState>>({
    blue: { id: 'blue', name: 'Alkali Boyz', score: 0, color: 'text-cyan-400', streak: 0, cards: [] },
    red: { id: 'red', name: 'Noble Flow', score: 0, color: 'text-rose-500', streak: 0, cards: [] }
  });
  
  const [currentTurn, setCurrentTurn] = useState<Team>('blue');
  const [turnNumber, setTurnNumber] = useState(1);
  const [elementStates, setElementStates] = useState<Record<number, ElementState>>({});
  
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const [activeCardMode, setActiveCardMode] = useState<ActionCard | null>(null);

  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, correctAnswer: string } | null>(null);
  
  const [turnFreeze, setTurnFreeze] = useState<{blue: number, red: number}>({ blue: 0, red: 0 });
  const [attackPower, setAttackPower] = useState<1 | 2 | 3>(1);
  const [showRules, setShowRules] = useState(false);

  // Initialize Board
  const startGame = () => {
    setPhase('battle');
    setTeams({
      blue: { ...teams.blue, score: 0, streak: 0, cards: [] },
      red: { ...teams.red, score: 0, streak: 0, cards: [] }
    });
    setElementStates({
      1: { owner: 'blue' }, // Hydrogen
      2: { owner: 'red' }   // Helium
    });
    setCurrentTurn('blue');
    setTurnNumber(1);
    setUsedQuestions(new Set());
    setFeedback(null);
    setTurnFreeze({ blue: 0, red: 0 });
    setAttackPower(1);
  };

  // Timer
  useEffect(() => {
    if (selectedElement && currentQuestion && timeLeft > 0 && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedElement && !feedback) {
      handleAnswer(''); // Time up triggers wrong answer
    }
  }, [timeLeft, selectedElement, currentQuestion, feedback]);

  const isAdjacentToOwned = (team: Team, targetEl: Element) => {
    const owned = elementsData.elements.filter(e => elementStates[e.number]?.owner === team);
    return owned.some(o => {
      const dx = Math.abs(o.xpos - targetEl.xpos);
      const dy = Math.abs(o.ypos - targetEl.ypos);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });
  };

  const getRandomQuestion = (element: Element, isOvertake: boolean, useHardPool: boolean = false) => {
    const qdb = battleQuestions.questionDatabase as any;
    const pools = (isOvertake || useHardPool) 
      ? [qdb.type_5_compare_elements?.pool, qdb.type_6_periodic_trends?.pool, qdb.type_7_visual_error_challenge?.pool].filter(Boolean)
      : [qdb.type_1_multiple_choice?.pool, qdb.type_2_short_answer?.pool, qdb.type_3_electron_configuration?.pool, qdb.type_4_position_on_periodic_table?.pool].filter(Boolean);
    
    if (pools.length === 0) return { q: "No question available", a: "skip", opts: [] };

    // Find all unused questions across all valid pools
    let allUnused = pools.flatMap((p: any) => p.filter((q: any) => !usedQuestions.has(q.id)));
    
    // If completely out of questions in these pools, recycle them
    if (allUnused.length === 0) {
      setUsedQuestions(new Set()); // Reset the tracking set
      allUnused = pools.flatMap((p: any) => p); 
    }

    // Try to find an unused question for the specific element
    let elQuestions = allUnused.filter((q: any) => q.element === element.symbol);
    
    // Fallback to any unused question from any of the relevant pools
    if (elQuestions.length === 0) {
      elQuestions = allUnused;
    }
    
    return elQuestions[Math.floor(Math.random() * elQuestions.length)];
  };

  const handleElementClick = (element: Element) => {
    const state = elementStates[element.number];
    
    if (activeCardMode) {
      handleCardAction(element);
      return;
    }

    if (state?.owner === currentTurn) return; // Can't attack own
    if (state?.lockedUntilTurn && state.lockedUntilTurn >= turnNumber) return; // Locked

    if (!isAdjacentToOwned(currentTurn, element)) {
      alert("You can only attack adjacent elements!");
      return;
    }

    const isOvertake = !!state?.owner;
    let question = getRandomQuestion(element, isOvertake, attackPower > 1);

    // If the question doesn't have options, generate and shuffle them ONCE here
    if (!question.opts) {
      const mockOpts = [
        question.a,
        question.a + " (Incorrect variant 1)",
        question.a + " (Incorrect variant 2)",
        "Skip"
      ].sort(() => 0.5 - Math.random());
      
      question = { ...question, opts: mockOpts };
    }
    
    setSelectedElement(element);
    setCurrentQuestion({ ...question, isOvertake, usedAttackPower: attackPower });
    setTimeLeft(isOvertake || attackPower > 1 ? 15 : 30);
  };

  const handleCardAction = (element: Element) => {
    if (activeCardMode === 'Catalyst') {
      if (element.number > 20) return alert("Catalyst only works up to atomic number 20 (Ca).");
      if (elementStates[element.number]?.owner) return alert("Element already owned!");
      if (!isAdjacentToOwned(currentTurn, element)) return alert("Must be adjacent!");
      
      setElementStates(prev => ({ ...prev, [element.number]: { owner: currentTurn } }));
      setTeams(prev => ({ ...prev, [currentTurn]: { ...prev[currentTurn], score: prev[currentTurn].score + 50 } }));
    } 
    else if (activeCardMode === 'Radioactive Decay') {
      if (!elementStates[element.number]?.owner || elementStates[element.number]?.owner === currentTurn) return alert("Select an enemy element!");
      if (elementStates[element.number]?.lockedUntilTurn && elementStates[element.number]!.lockedUntilTurn! >= turnNumber) return alert("Element is shielded!");
      
      setElementStates(prev => {
        const next = { ...prev };
        delete next[element.number];
        return next;
      });
    }
    else if (activeCardMode === 'Inert Shield') {
      if (elementStates[element.number]?.owner !== currentTurn) return alert("Select your own element to shield!");
      setElementStates(prev => ({
        ...prev,
        [element.number]: { ...prev[element.number], lockedUntilTurn: turnNumber + 3 }
      }));
    }

    // Consume card
    setTeams(prev => ({
      ...prev,
      [currentTurn]: { ...prev[currentTurn], cards: prev[currentTurn].cards.filter((_, i) => i !== prev[currentTurn].cards.findIndex(c => c === activeCardMode)) }
    }));
    setActiveCardMode(null);
    nextTurn();
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || !selectedElement || feedback) return;

    if (currentQuestion.id) {
      setUsedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }

    const isCorrect = answer === currentQuestion.a;
    const isOvertake = currentQuestion.isOvertake;

    setFeedback({ isCorrect, correctAnswer: currentQuestion.a });

    setTeams(prev => {
      const currentTeamState = prev[currentTurn];
      const rival = currentTurn === 'blue' ? 'red' : 'blue';
      const next = { ...prev };

      if (isCorrect) {
        next[currentTurn].score += isOvertake ? 200 : 100;
        next[currentTurn].streak += 1;

        if (next[currentTurn].streak === 3) {
          const possibleCards: ActionCard[] = ['Catalyst', 'Radioactive Decay', 'Inert Shield'];
          next[currentTurn].cards.push(possibleCards[Math.floor(Math.random() * possibleCards.length)]);
          next[currentTurn].streak = 0; // Reset after awarding
        }

        // Capture element + multi-attack bonuses
        const usedPower = currentQuestion.usedAttackPower || 1;
        setElementStates(states => {
          const nextStates = { ...states, [selectedElement.number]: { owner: currentTurn } };
          if (usedPower > 1) {
            let currentOwned = elementsData.elements.filter(e => nextStates[e.number]?.owner === currentTurn);
            for (let i = 0; i < usedPower - 1; i++) {
              const available = elementsData.elements.filter(e => !nextStates[e.number]?.owner && currentOwned.some(o => {
                const dx = Math.abs(o.xpos - e.xpos);
                const dy = Math.abs(o.ypos - e.ypos);
                return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
              }));
              if (available.length > 0) {
                const chosen = available[Math.floor(Math.random() * available.length)];
                nextStates[chosen.number] = { owner: currentTurn };
                next[currentTurn].score += 100;
                currentOwned.push(chosen);
              }
            }
          }
          return nextStates;
        });
      } else {
        next[currentTurn].streak = 0;
        if (isOvertake) {
          next[currentTurn].score -= 100;
          next[rival].score += 100;
        }
        const usedPower = currentQuestion.usedAttackPower || 1;
        if (usedPower > 1) {
          setTurnFreeze(pf => ({ ...pf, [currentTurn]: pf[currentTurn] + (usedPower - 1) }));
        }
      }

      return next;
    });
    // We do NOT call nextTurn here anymore. The user will click Continue to advance.
  };

  const nextTurn = () => {
    setSelectedElement(null);
    setCurrentQuestion(null);
    setActiveCardMode(null);
    setFeedback(null);
    setAttackPower(1);
    
    let nextTeam: 'blue' | 'red' = currentTurn === 'blue' ? 'red' : 'blue';
    
    // Check if next team is frozen
    setTurnFreeze(prevFreeze => {
      const nextFreeze = { ...prevFreeze };
      if (nextFreeze[nextTeam] > 0) {
        nextFreeze[nextTeam] -= 1;
        // Next team is frozen, current team goes again
        setCurrentTurn(currentTurn);
      } else {
        setCurrentTurn(nextTeam);
      }
      return nextFreeze;
    });

    setTurnNumber(prev => prev + 1);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-[#0B0F19]" />
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-8 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Hub
          </Link>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-wider">
              Periodic Table Battle
            </h1>
            <p className="text-cyan-100/70">Strategic Area Control Chemistry Board Game</p>
          </div>

          <div className="space-y-6 mb-12">
            <div>
              <label className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-widest">Team Blue</label>
              <input 
                type="text" 
                value={teams.blue.name} 
                onChange={e => setTeams(prev => ({ ...prev, blue: { ...prev.blue, name: e.target.value } }))}
                className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-rose-500 mb-2 uppercase tracking-widest">Team Red</label>
              <input 
                type="text" 
                value={teams.red.name} 
                onChange={e => setTeams(prev => ({ ...prev, red: { ...prev.red, name: e.target.value } }))}
                className="w-full bg-slate-950/50 border border-rose-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)] focus:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all"
              />
            </div>
          </div>

          <button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xl py-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all flex justify-center items-center gap-3 uppercase tracking-widest"
          >
            <Swords className="w-6 h-6" />
            Initialize Battle
          </button>
          
          <button 
            onClick={() => setShowRules(true)}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl border border-slate-600 transition-all flex justify-center items-center gap-2 tracking-widest text-sm"
          >
            <Info className="w-5 h-5" />
            How to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
      
      {/* Top Bar HUD */}
      <div className="relative z-20 flex justify-between items-center p-4 md:px-8 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Blue Team Panel */}
        <div className={`flex flex-col p-4 rounded-2xl min-w-[200px] border transition-all duration-300 ${currentTurn === 'blue' ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'bg-slate-900/50 border-white/5 opacity-70'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{teams.blue.name}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${teams.blue.streak >= i ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
          <span className="text-4xl font-black text-white">{teams.blue.score}</span>
          
          {/* Action Cards */}
          <div className="flex gap-2 mt-3">
            {teams.blue.cards.map((c, i) => (
              <button 
                key={i} 
                onClick={() => currentTurn === 'blue' && setActiveCardMode(c)}
                className={`text-[10px] font-bold px-2 py-1 rounded border border-cyan-500/50 hover:bg-cyan-500 hover:text-[#0B0F19] transition-colors truncate max-w-[80px] ${activeCardMode === c ? 'bg-cyan-400 text-slate-900' : 'bg-slate-800'}`}
                title={c}
              >
                {c.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Center Info */}
        <div className="text-center flex-grow mx-4 flex flex-col items-center relative">
          <button 
            onClick={() => setShowRules(true)}
            className="absolute -top-2 right-0 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-800 rounded-full p-1 border border-slate-700 shadow-lg"
            title="How to Play"
          >
            <Info className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black tracking-widest text-slate-500 uppercase">Turn {turnNumber}</h2>
          <div className={`text-lg font-black mt-1 uppercase tracking-widest animate-pulse ${currentTurn === 'blue' ? 'text-cyan-400' : 'text-rose-500'}`}>
            {teams[currentTurn].name} to Command
          </div>
          
          {/* Frozen Indicator */}
          {(turnFreeze.blue > 0 || turnFreeze.red > 0) && (
            <div className="mt-2 text-sm text-slate-300">
              {turnFreeze.blue > 0 && <span className="text-cyan-400 font-bold mr-2">❄️ Blue Frozen ({turnFreeze.blue})</span>}
              {turnFreeze.red > 0 && <span className="text-rose-500 font-bold">❄️ Red Frozen ({turnFreeze.red})</span>}
            </div>
          )}

          {/* Attack Mode Selector */}
          <div className="mt-4 flex gap-2 justify-center">
            {[
              { level: 1, label: '1x (Standard)', color: 'border-slate-500 text-slate-400 hover:border-slate-300 hover:text-white' },
              { level: 2, label: '2x (Risk 1 Turn)', color: 'border-yellow-500/50 text-yellow-500 hover:border-yellow-400' },
              { level: 3, label: '3x (Risk 2 Turns)', color: 'border-rose-500/50 text-rose-500 hover:border-rose-400' }
            ].map(mode => (
              <button
                key={mode.level}
                onClick={() => setAttackPower(mode.level as 1|2|3)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border transition-all ${attackPower === mode.level ? (mode.level === 1 ? 'bg-slate-700 text-white border-slate-500' : mode.level === 2 ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-rose-500 text-white border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]') : mode.color}`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {activeCardMode && (
            <div className="mt-2 text-yellow-400 font-bold text-sm bg-yellow-400/10 inline-block px-4 py-1 rounded-full border border-yellow-400/30">
              Select Target for {activeCardMode}
            </div>
          )}
        </div>

        {/* Red Team Panel */}
        <div className={`flex flex-col p-4 rounded-2xl min-w-[200px] border transition-all duration-300 items-end ${currentTurn === 'red' ? 'bg-rose-950/50 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-900/50 border-white/5 opacity-70'}`}>
          <div className="flex justify-between items-center mb-1 w-full flex-row-reverse">
            <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{teams.red.name}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${teams.red.streak >= i ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
          <span className="text-4xl font-black text-white">{teams.red.score}</span>
          
          {/* Action Cards */}
          <div className="flex gap-2 mt-3 flex-row-reverse">
            {teams.red.cards.map((c, i) => (
              <button 
                key={i} 
                onClick={() => currentTurn === 'red' && setActiveCardMode(c)}
                className={`text-[10px] font-bold px-2 py-1 rounded border border-rose-500/50 hover:bg-rose-500 hover:text-[#0B0F19] transition-colors truncate max-w-[80px] ${activeCardMode === c ? 'bg-rose-400 text-slate-900' : 'bg-slate-800'}`}
                title={c}
              >
                {c.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Periodic Table Grid */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 overflow-auto relative z-10">
        <div 
          className="grid gap-1 md:gap-1.5" 
          style={{ 
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            width: '100%',
            maxWidth: '1500px'
          }}
        >
          {elementsData.elements.map(el => {
            const state = elementStates[el.number];
            const isAdj = isAdjacentToOwned(currentTurn, el);
            
            // Visual Styles Base
            let bgClass = "bg-slate-800/60 border-white/10 text-slate-400";
            let animClass = "";
            let glowClass = "";
            let lockedClass = "";

            // Idle specific themes
            if (!state?.owner) {
              if (el.phase === 'Gas') animClass = "animate-pulse bg-slate-700/50";
              if (el.category.includes('metal')) animClass = "overflow-hidden relative after:content-[''] after:absolute after:top-0 after:left-[-100%] after:w-[50%] after:h-[100%] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:skew-x-[-20deg] hover:after:animate-[shimmer_1.5s_infinite]";
              if (el.category.includes('actinide') || el.category.includes('lanthanide')) glowClass = "shadow-[inset_0_0_10px_rgba(132,204,22,0.2)] border-lime-500/20";
            }

            // Ownership Styles
            if (state?.owner === 'blue') {
              bgClass = "bg-cyan-900 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10";
              animClass = "relative overflow-hidden before:absolute before:inset-0 before:bg-cyan-400/20 before:animate-ping"; // Capture ripple fallback
            }
            if (state?.owner === 'red') {
              bgClass = "bg-rose-900 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] z-10";
              animClass = "relative overflow-hidden before:absolute before:inset-0 before:bg-rose-500/20 before:animate-ping";
            }

            // Locked Shield UI
            if (state?.lockedUntilTurn && state.lockedUntilTurn >= turnNumber) {
              lockedClass = "border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]";
            }

            // Targeting interactability
            const interactable = isAdj || activeCardMode || state?.owner;
            const pointerClass = interactable ? 'cursor-pointer hover:scale-110 hover:z-20 hover:border-white' : 'cursor-not-allowed opacity-40';

            return (
              <div
                key={el.number}
                className="group relative"
                style={{ gridColumn: el.xpos, gridRow: el.ypos }}
              >
                <button
                  onClick={() => handleElementClick(el)}
                  className={`w-full aspect-square rounded flex flex-col items-center justify-center border transition-all duration-300 ${bgClass} ${animClass} ${glowClass} ${lockedClass} ${pointerClass}`}
                >
                  <span className="absolute top-0.5 left-1 text-[8px] md:text-[10px] font-bold opacity-70">{el.number}</span>
                  <span className="text-sm md:text-xl font-black">{el.symbol}</span>
                  {state?.lockedUntilTurn && state.lockedUntilTurn >= turnNumber && (
                    <Shield className="absolute bottom-1 right-1 w-3 h-3 text-yellow-400" />
                  )}
                </button>
                
                {/* Hover Micro-card (Bohr Model) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900/95 border border-white/20 rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 flex flex-col items-center backdrop-blur-xl">
                  <div className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">{el.name}</div>
                  {el.bohr_model_image && (
                    <img src={el.bohr_model_image} alt={`${el.name} bohr model`} className="w-16 h-16 object-contain invert hue-rotate-180 brightness-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  )}
                  <div className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-wider">
                    {el.category} <br/> {el.phase}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action/Question Modal */}
      {selectedElement && currentQuestion && (
        <div className="fixed inset-0 bg-[#0B0F19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className={`bg-slate-900 border-2 p-8 md:p-12 rounded-3xl max-w-3xl w-full shadow-2xl relative overflow-hidden ${currentQuestion.isOvertake ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : currentTurn === 'blue' ? 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]'}`}>
            
            {currentQuestion.isOvertake && (
              <div className="absolute top-0 left-0 right-0 bg-amber-500 text-slate-900 font-black text-center py-1 text-sm uppercase tracking-widest animate-pulse">
                ⚠️ OVERTAKE DUEL INITIATED ⚠️
              </div>
            )}
            
            <div className="flex justify-between items-start mb-10 mt-4">
              <div>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block ${currentQuestion.isOvertake ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-slate-300'}`}>
                  {currentQuestion.isOvertake ? 'High Security' : 'Standard Capture'}
                </span>
                <h3 className="text-3xl md:text-4xl font-medium text-white leading-tight">
                  {currentQuestion.q}
                </h3>
              </div>
              <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shrink-0 bg-slate-950 ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-slate-700 text-white'}`}>
                <span className="text-3xl font-black">{timeLeft}</span>
              </div>
            </div>

            {/* Answer Layouts depending on question opts presence */}
            {feedback ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl border border-white/10 text-center animate-in fade-in slide-in-from-bottom-4">
                <h2 className={`text-4xl md:text-5xl font-black mb-4 ${feedback.isCorrect ? 'text-green-400' : 'text-red-500'}`}>
                  {feedback.isCorrect ? 'CORRECT!' : 'INCORRECT!'}
                </h2>
                {!feedback.isCorrect && (
                  <p className="text-xl md:text-2xl text-white mb-4">
                    Correct Answer: <span className="font-black text-green-400">{feedback.correctAnswer}</span>
                  </p>
                )}
                {currentQuestion.desc && (
                  <p className="text-slate-400 mt-2 max-w-xl mx-auto italic border-l-4 border-cyan-500/50 pl-4 py-1 text-lg">
                    {currentQuestion.desc}
                  </p>
                )}
                
                <button 
                  onClick={nextTurn} 
                  className="mt-8 px-10 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-blue-700 rounded-full font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 border border-white/10"
                >
                  Continue Battle
                </button>
              </div>
            ) : currentQuestion.opts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.opts.map((ans: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(ans)}
                    className="bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-white/30 p-5 rounded-2xl text-xl font-medium text-left transition-all hover:scale-[1.02]"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            ) : (
              // For short answers / electron config, provide a text input (in real life) but for this MVP, simulate buttons with the correct and random wrong answers
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[currentQuestion.a, currentQuestion.a + " (Incorrect variant 1)", currentQuestion.a + " (Incorrect variant 2)", "Skip"].sort(() => 0.5 - Math.random()).map((ans: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(ans)}
                    className="bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-white/30 p-5 rounded-2xl text-xl font-medium text-left transition-all hover:scale-[1.02]"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-sm font-bold tracking-wider text-slate-500 uppercase">
              <span className="flex items-center">
                <Atom className="w-4 h-4 mr-2" />
                Target: <strong className="text-white ml-2">{selectedElement.name}</strong>
              </span>
              <span className={currentTurn === 'blue' ? 'text-cyan-400' : 'text-rose-500'}>
                {teams[currentTurn].name} COMMANDING
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Global CSS for shimmer animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { left: 200%; }
        }
      `}} />
    </div>

      {showRules && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-cyan-400 mb-6 uppercase tracking-widest flex items-center gap-3">
              <Info className="w-8 h-8" />
              How to Play
            </h2>
            
            <div className="space-y-6 text-slate-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🎯 Objective</h3>
                <p>Command your team to conquer the Periodic Table! Answer chemistry questions to capture elements. The team with the most points wins.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">⚔️ Capturing Elements</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Neutral Elements:</strong> Click any empty element adjacent to your territory. You have 30 seconds.</li>
                  <li><strong>Overtake (Enemy Elements):</strong> Steal an element from the enemy! You get harder questions and only 15 seconds. Win: +200 pts. Lose: -100 pts.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">🚀 Multi-Attack & Chemical Freeze</h3>
                <p className="mb-2">Want to expand faster? Choose a higher attack power before your move:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-slate-400">1x (Standard):</strong> Capture 1 cell.</li>
                  <li><strong className="text-yellow-500">2x (Double):</strong> Capture target + 1 random adjacent cell. <span className="text-rose-400">Risk: Miss 1 turn if wrong.</span></li>
                  <li><strong className="text-rose-500">3x (Triple):</strong> Capture target + 2 random adjacent cells. <span className="text-rose-400">Risk: Miss 2 turns if wrong.</span></li>
                </ul>
                <p className="text-sm italic mt-2 text-slate-400">Note: Multi-attacks give you harder questions and only 15 seconds!</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">🃏 Action Cards</h3>
                <p>Answer 3 questions correctly in a row to earn an Action Card!</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Catalyst:</strong> Instantly capture any neutral element up to atomic number 20 (Ca).</li>
                  <li><strong>Radioactive Decay:</strong> Destroy an enemy's element, turning it neutral again.</li>
                  <li><strong>Inert Shield:</strong> Protect one of your elements from being overtaken for 3 turns.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
