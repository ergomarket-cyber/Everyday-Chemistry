const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `import { ArrowLeft, Swords, Shield, Zap, Skull, Flame, Atom } from 'lucide-react';`,
  `import { ArrowLeft, Swords, Shield, Zap, Skull, Flame, Atom, Info, X } from 'lucide-react';`
);

code = code.replace(
  `  const [attackPower, setAttackPower] = useState<1 | 2 | 3>(1);`,
  `  const [attackPower, setAttackPower] = useState<1 | 2 | 3>(1);
  const [showRules, setShowRules] = useState(false);`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched state and imports");
