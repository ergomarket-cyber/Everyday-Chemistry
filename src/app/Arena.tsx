'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Beaker, Flame, Trophy, Music, Sparkles, CheckCircle2, AlignLeft, ChevronDown, ChevronUp, User, LogOut, Users, Settings } from 'lucide-react';

export default function Arena({ initialTeams, students10, students11 }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [votes, setVotes] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);

  useEffect(() => {
    const initialVotes: any = {};
    initialTeams.forEach((team: any) => {
      initialVotes[team.id] = { science: 0, banger: 0 };
    });
    setVotes(initialVotes);
  }, [initialTeams]);

  const handleVote = (teamId: string, category: string, value: number) => {
    setVotes((prev: any) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [category]: value
      }
    }));
  };

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call to vote
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          votes
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to submit votes');
        setIsSubmitting(false);
        return;
      }

      // Fetch results
      const resultsRes = await fetch('/api/results');
      const resultsData = await resultsRes.json();
      setResultsData(resultsData.results);
      
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Error submitting votes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSubmitted(false);
    setResultsData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return <LoginScreen 
      students10={students10} 
      students11={students11} 
      onLogin={(user: any) => {
        setCurrentUser(user);
        setActiveTab(user.grade);
        if (user.hasVoted) {
          // If already voted, fetch results and show them
          fetch('/api/results').then(r => r.json()).then(data => {
            setResultsData(data.results);
            setIsSubmitted(true);
          });
        }
      }} 
    />;
  }

  if (isSubmitted) {
    return <ResultsScreen onLogout={logout} results={resultsData} />;
  }

  // Ensure they voted for ALL teams in their grade (except their own team)
  const teamsInMyGrade = initialTeams.filter((t: any) => t.grade === currentUser.grade);
  const otherTeamsInMyGrade = teamsInMyGrade.filter((t: any) => !t.members.includes(currentUser.name));
  
  const isAllVoted = otherTeamsInMyGrade.every((team: any) => {
    const teamVotes = votes[team.id];
    return teamVotes && teamVotes.science > 0 && teamVotes.banger > 0;
  });

  const activeTeams = initialTeams.filter((t: any) => t.grade === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pb-28">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

      <header className="relative pt-8 pb-6 px-4 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Voting As</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{currentUser.name}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500">
              ChemBeats '26
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Rate the tracks. Be honest.</p>
        </div>

        <div className="max-w-md mx-auto bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab(10)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 10 ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            10th Grade
          </button>
          <button
            onClick={() => setActiveTab(11)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 11 ? 'bg-white/10 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            11th Grade
          </button>
        </div>
      </header>

      <main className="relative px-4 max-w-md mx-auto z-10 space-y-6">
        {activeTeams.map((team: any) => (
          <TeamCard 
            key={team.id}
            team={team}
            isPlaying={playingId === team.id}
            onPlay={() => togglePlay(team.id)}
            votes={votes[team.id]}
            onVote={handleVote}
            currentUser={currentUser}
          />
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isAllVoted || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isAllVoted && !isSubmitting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white scale-100' 
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed scale-95'
            }`}
          >
            {isSubmitting ? 'Submitting...' : isAllVoted ? (
              <>
                <Sparkles className="w-5 h-5" />
                Submit My Votes
              </>
            ) : (
              'Rate at least one track'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
      
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 mb-4 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            <Music className="w-10 h-10 text-pink-400 mr-2" />
            <Beaker className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">ChemBeats <span className="text-purple-500">'26</span></h1>
          <p className="text-slate-400 font-medium">Log in to enter the voting arena.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">1. Select Your Class</label>
            <div className="flex gap-3">
              <button 
                onClick={() => { setSelectedGrade(10); setSelectedName(""); setError(""); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedGrade === 10 ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                10th Grade
              </button>
              <button 
                onClick={() => { setSelectedGrade(11); setSelectedName(""); setError(""); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedGrade === 11 ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                11th Grade
              </button>
            </div>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${selectedGrade ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">2. Who are you?</label>
            <select 
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium appearance-none outline-none focus:border-purple-500 transition-colors"
            >
              <option value="" disabled>Select your name...</option>
              {selectedGrade && studentOptions.map((name: string) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className={`space-y-3 transition-all duration-500 ${selectedName ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">3. Enter PIN</label>
            <input 
              type="password"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium outline-none focus:border-purple-500 transition-colors text-center tracking-[0.5em] text-xl"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-bold text-center bg-rose-500/10 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleEnter}
            disabled={!selectedName || pin.length < 4 || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedName && pin.length >= 4 && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-[1.02] shadow-lg shadow-purple-500/25' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Checking...' : 'Enter Arena'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, isPlaying, onPlay, votes, onVote, currentUser }: any) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isMyTeam = team.members.includes(currentUser.name);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
           console.log("Audio play failed or file missing");
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden ${isMyTeam ? 'bg-purple-900/10 border-purple-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'}`}>
      {team.audioUrl && (
        <audio ref={audioRef} src={team.audioUrl} loop onEnded={onPlay} />
      )}
      
      {isEditing && (
        <EditTeamModal team={team} onClose={() => setIsEditing(false)} />
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${team.color} shadow-lg shrink-0`}>
          {team.avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{team.song}</h2>
          <p className="text-sm text-slate-400 font-medium truncate">{team.name}</p>
          <div className="flex gap-2 mt-1.5">
            <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] uppercase tracking-widest text-slate-300">
              {team.topic}
            </span>
          </div>
        </div>

        <button 
          onClick={onPlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
            isPlaying 
              ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
      </div>

      <div className={`flex items-end justify-center gap-1 h-8 transition-all duration-300 overflow-hidden ${isPlaying ? 'opacity-100 mb-4' : 'opacity-0 h-0 mb-0'}`}>
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 bg-gradient-to-t ${team.color} rounded-t-sm animate-pulse`}
            style={{ 
              height: isPlaying ? `${Math.random() * 100}%` : '10%',
              animationDuration: `${0.3 + Math.random() * 0.5}s`,
              animationDelay: `${Math.random() * 0.2}s`
            }}
          />
        ))}
      </div>

      <div className="space-y-2 mb-5">
        <div>
          <button onClick={() => setShowMembers(!showMembers)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <Users className="w-3.5 h-3.5" />
            {showMembers ? 'Hide Roster' : 'Show Roster'}
          </button>
          <div className={`transition-all duration-300 overflow-hidden ${showMembers ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="flex flex-wrap gap-1.5">
              {team.members.map((member: string) => (
                <span key={member} className={`px-2 py-1 text-[11px] font-medium rounded-md ${member === currentUser.name ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-slate-300 border border-white/10'}`}>
                  {member}
                  {member === team.members[0] && <span className="ml-1">👑</span>}
             </span>
              ))}
            </div>
          </div>
        </div>

        <div>
           <button onClick={() => setShowLyrics(!showLyrics)} className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-colors border border-white/5 mt-2">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-pink-400" />
              Read Lyrics
            </div>
            {showLyrics ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLyrics ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-y-auto max-h-56 overscroll-contain">
              <p className="whitespace-pre-line text-[14px] text-slate-300 text-center font-medium italic leading-relaxed">
                {team.lyrics}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        {isMyTeam ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-purple-300">This is your team! No self-voting.</span>
            </div>
            {currentUser.isCaptain && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <Settings className="w-4 h-4" /> Edit Team Profile
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <VotingRow 
              label="Science Core" 
              icon={<Beaker className="w-4 h-4 text-cyan-400" />}
              value={votes?.science || 0}
              onChange={(val: number) => onVote(team.id, 'science', val)}
              activeColor="bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
            <VotingRow 
              label="Banger Vibe" 
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              value={votes?.banger || 0}
              onChange={(val: number) => onVote(team.id, 'banger', val)}
              activeColor="bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VotingRow({ label, icon, value, onChange, activeColor }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-slate-300">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-7 h-7 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
              value >= num 
                ? `${activeColor} text-black scale-110` 
                : 'bg-white/5 text-slate-500 hover:bg-white/10'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultsScreen({ onLogout, results }: any) {
  if (!results) return null;

  const grade10Results = results.filter((r: any) => r.grade === 10);
  const grade11Results = results.filter((r: any) => r.grade === 11);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
      
      <div className="relative z-10 text-center space-y-6 max-w-md w-full pt-10 pb-20">
        <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.3)] animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black mb-2">Votes Cast!</h1>
          <p className="text-slate-400">Your opinion is locked in the matrix. Let's see the current leaders.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mt-6 text-left">
          <h3 className="flex items-center gap-2 font-bold text-md mb-4 text-purple-300">
            <Trophy className="w-4 h-4" /> Grade 10 Leaders
          </h3>
          <div className="space-y-3">
            {grade10Results.map((r: any) => (
              <LeaderRow key={r.id} name={r.name} score={r.totalScore} votesCount={r.votesCount} />
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mt-4 text-left">
          <h3 className="flex items-center gap-2 font-bold text-md mb-4 text-pink-300">
            <Trophy className="w-4 h-4" /> Grade 11 Leaders
          </h3>
          <div className="space-y-3">
            {grade11Results.map((r: any) => (
              <LeaderRow key={r.id} name={r.name} score={r.totalScore} votesCount={r.votesCount} />
            ))}
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="mt-8 text-sm font-semibold text-slate-500 hover:text-white transition-colors underline underline-offset-4"
        >
          Vote as another student (Debug)
        </button>
      </div>
    </div>
  );
}

function LeaderRow({ name, score, votesCount }: any) {
  return (
    <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-white/5">
      <div className="flex flex-col items-start">
        <span className="font-bold text-sm text-white">{name}</span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
          <Users className="w-3 h-3 text-cyan-400"/> {votesCount} votes
        </div>
      </div>
      <div className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
        {score}
      </div>
    </div>
  );
}

function EditTeamModal({ team, onClose }: any) {
  const [formData, setFormData] = useState({
    name: team.name,
    topic: team.topic,
    avatar: team.avatar,
    lyrics: team.lyrics,
    audioUrl: team.audioUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id, ...formData })
      });
      if (res.ok) {
        window.location.reload(); // Refresh to see changes
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      alert('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Edit Team Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Team Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Motto / Topic</label>
              <input 
                type="text" 
                value={formData.topic} 
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Avatar (Emoji)</label>
              <input 
                type="text" 
                maxLength={2}
                value={formData.avatar} 
                onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 text-2xl text-center" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Audio URL</label>
              <input 
                type="text" 
                placeholder="e.g. /audio/my-song.mp3 or a link"
                value={formData.audioUrl} 
                onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500" 
              />
              <p className="text-[10px] text-slate-500 mt-1">Paste a link to your audio file, or ask the teacher to upload it.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Lyrics</label>
              <textarea 
                rows={5}
                value={formData.lyrics} 
                onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 font-mono text-sm" 
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors shadow-lg shadow-purple-500/20"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
