const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `          <button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xl py-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all flex justify-center items-center gap-3 uppercase tracking-widest"
          >
            <Swords className="w-6 h-6" />
            Initialize Battle
          </button>
        </div>`,
  `          <button 
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
        </div>`
);

code = code.replace(
  `        {/* Center Info */}
        <div className="text-center flex-grow mx-4 flex flex-col items-center">
          <h2 className="text-xl font-black tracking-widest text-slate-500 uppercase">Turn {turnNumber}</h2>`,
  `        {/* Center Info */}
        <div className="text-center flex-grow mx-4 flex flex-col items-center relative">
          <button 
            onClick={() => setShowRules(true)}
            className="absolute -top-2 right-0 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-800 rounded-full p-1 border border-slate-700 shadow-lg"
            title="How to Play"
          >
            <Info className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black tracking-widest text-slate-500 uppercase">Turn {turnNumber}</h2>`
);

code = code.replace(
  `    </div>
  );
}`,
  `    </div>

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
  );
}`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched rules UI");
