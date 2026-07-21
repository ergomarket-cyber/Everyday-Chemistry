const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, correctAnswer: string } | null>(null);`,
  `const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, correctAnswer: string } | null>(null);
  
  const [turnFreeze, setTurnFreeze] = useState<{blue: number, red: number}>({ blue: 0, red: 0 });
  const [attackPower, setAttackPower] = useState<1 | 2 | 3>(1);`
);

code = code.replace(
  `    setUsedQuestions(new Set());
    setFeedback(null);
  };`,
  `    setUsedQuestions(new Set());
    setFeedback(null);
    setTurnFreeze({ blue: 0, red: 0 });
    setAttackPower(1);
  };`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched states");
