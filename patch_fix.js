const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col relative overflow-hidden font-sans">`,
  `  return (
    <>
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col relative overflow-hidden font-sans">`
);

code = code.replace(
  `      )}
  );
}`,
  `      )}
    </>
  );
}`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched JSX fragment");
