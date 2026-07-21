const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `        {/* Center Info */}
        <div className="text-center flex-grow mx-4">
          <h2 className="text-xl font-black tracking-widest text-slate-500 uppercase">Turn {turnNumber}</h2>
          <div className={\`text-lg font-black mt-1 uppercase tracking-widest animate-pulse \${currentTurn === 'blue' ? 'text-cyan-400' : 'text-rose-500'}\`}>
            {teams[currentTurn].name} to Command
          </div>
          {activeCardMode && (
            <div className="mt-2 text-yellow-400 font-bold text-sm bg-yellow-400/10 inline-block px-4 py-1 rounded-full border border-yellow-400/30">
              Select Target for {activeCardMode}
            </div>
          )}
        </div>`,
  `        {/* Center Info */}
        <div className="text-center flex-grow mx-4 flex flex-col items-center">
          <h2 className="text-xl font-black tracking-widest text-slate-500 uppercase">Turn {turnNumber}</h2>
          <div className={\`text-lg font-black mt-1 uppercase tracking-widest animate-pulse \${currentTurn === 'blue' ? 'text-cyan-400' : 'text-rose-500'}\`}>
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
                className={\`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border transition-all \${attackPower === mode.level ? (mode.level === 1 ? 'bg-slate-700 text-white border-slate-500' : mode.level === 2 ? 'bg-yellow-500 text-slate-900 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-rose-500 text-white border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]') : mode.color}\`}
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
        </div>`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched UI");
