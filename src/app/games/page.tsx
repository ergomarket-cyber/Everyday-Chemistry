import Link from 'next/link';
import { Swords, ArrowLeft, Beaker } from 'lucide-react';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
      
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Hub
        </Link>

        <header className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Games
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl font-medium">
            Challenge your friends, test your knowledge, and conquer chemistry through interactive battles.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Periodic Table Battle Card */}
          <Link href="/games/periodic-battle" className="group relative rounded-3xl bg-slate-900/50 border border-white/10 p-8 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 shadow-2xl overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Swords className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                Strategy Battle
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-3 text-white">Periodic Table Battle</h2>
            <p className="text-slate-400 mb-8 flex-grow leading-relaxed">
              Two teams compete to capture elements on a virtual periodic table by answering chemistry questions. Conquer the table and prove your mastery!
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex space-x-2">
                <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">1v1 or Team</span>
                <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">Smartboard</span>
              </div>
              <button className="bg-white/10 group-hover:bg-blue-600 text-white px-5 py-2 rounded-xl font-bold transition-colors">
                Play Now
              </button>
            </div>
          </Link>

          {/* Jeopardy Game Card */}
          <Link href="/games/jeopardy" className="group relative rounded-3xl bg-slate-900/50 border border-white/10 p-8 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Beaker className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                Interactive Quiz
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-3 text-white">Bonding Jeopardy</h2>
            <p className="text-slate-400 mb-8 flex-grow leading-relaxed">
              A classic Jeopardy-style game with 3D molecular renders. Answer questions on Ionic, Covalent, and Metallic bonding to earn points for your team!
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex space-x-2">
                <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">4 Teams</span>
                <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300">Classroom</span>
              </div>
              <button className="bg-white/10 group-hover:bg-cyan-600 text-white px-5 py-2 rounded-xl font-bold transition-colors">
                Play Now
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
