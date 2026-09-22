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

          {/* Interactive Experiments Section */}
          <Link href="/experiments" className="group">
            <div className="h-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                Our Experiments
              </h2>
              <p className="text-slate-400 mb-8 flex-grow">Access interactive chemistry experiments, record your core practical results, and analyze data across teams.</p>
              
              <div className="flex items-center text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                <span>View Experiments</span>
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
