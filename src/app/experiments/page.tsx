import Link from "next/link";
import { ArrowLeft, FlaskConical, Beaker, ChevronRight } from "lucide-react";

export default function ExperimentsDashboard() {
  const experiments = [
    { num: 1, title: "Solubility", ready: false },
    { num: 2, title: "Chromatography", ready: false },
    { num: 3, title: "Combustion and Reduction", ready: false },
    { num: 4, title: "Electrolysis", ready: false },
    { num: 5, title: "Rusting", ready: false },
    { num: 6, title: "Acid-Metal Reactions", ready: false },
    { num: 7, title: "Preparation of Copper Sulfate", ready: false },
    { num: 8, title: "Preparation of Lead Sulfate", ready: false },
    { num: 9, title: "Endothermic and Exothermic Reactions", ready: false },
    { num: 10, title: "Rates of Reaction", ready: true },
    { num: 11, title: "Catalytic Decomposition", ready: false },
    { num: 12, title: "Preparation of Ethyl Ethanoate", ready: false }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8 pt-8 relative">
          <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <FlaskConical className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Core Practical Experiments</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mt-4">
            Record your lab results, analyze data in real-time, and compare your team's findings with reference data and other teams.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((exp) => (
            <div key={exp.num} className="h-full">
              {exp.ready ? (
                <Link href={`/experiments/${exp.num}`} className="block h-full">
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 h-full hover:bg-slate-800 hover:border-emerald-500/60 transition-all group flex flex-col relative overflow-hidden shadow-lg shadow-emerald-900/10 cursor-pointer">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Exp. {exp.num}
                      </span>
                      <ChevronRight className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                      {exp.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center text-sm font-medium text-emerald-400/80">
                      <Beaker className="w-4 h-4 mr-2" />
                      Start Experiment
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full flex flex-col relative opacity-60">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                      Exp. {exp.num}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-600">Coming Soon</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-300 mb-2 leading-tight">
                    {exp.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
