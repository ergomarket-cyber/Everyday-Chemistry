import Link from 'next/link';
import { Gamepad2, Lightbulb, FlaskConical, ArrowRight } from 'lucide-react';

export default function HubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
      
      <div className="relative z-10 container mx-auto px-6 py-12 md:py-24 max-w-5xl">
        <header className="mb-16 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            ChemBeats Hub
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Explore the wonderful world of chemistry through games, creative projects, and interactive experiments.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Games Card */}
          <Link href="/games" className="group relative rounded-3xl bg-slate-900/50 border border-white/10 p-8 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Games</h2>
            <p className="text-slate-400 mb-8 flex-grow">Interactive challenges and battles to test your chemistry knowledge against your classmates.</p>
            <div className="flex items-center text-blue-400 font-semibold group-hover:gap-2 transition-all">
              <span>Play Now</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </Link>

          {/* Creative Projects Card */}
          <Link href="/voting" className="group relative rounded-3xl bg-slate-900/50 border border-white/10 p-8 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:border-purple-500/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Creative Projects</h2>
            <p className="text-slate-400 mb-8 flex-grow">Listen to chemistry songs, vote for your favorite teams, and explore creative works.</p>
            <div className="flex items-center text-purple-400 font-semibold group-hover:gap-2 transition-all">
              <span>Vote & Listen</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </Link>

          {/* Experiments Card */}
          <div className="group relative rounded-3xl bg-slate-900/50 border border-white/10 p-8 opacity-70 shadow-2xl overflow-hidden flex flex-col cursor-not-allowed">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
              <FlaskConical className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white flex justify-between items-center">
              Our Experiments
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Soon</span>
            </h2>
            <p className="text-slate-400 mb-8 flex-grow">Virtual labs and interactive chemistry experiments are currently in development.</p>
            <div className="flex items-center text-emerald-400/50 font-semibold">
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
