const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `  const nextTurn = () => {
    setSelectedElement(null);
    setCurrentQuestion(null);
    setActiveCardMode(null);
    setFeedback(null);
    setCurrentTurn(currentTurn === 'blue' ? 'red' : 'blue');
    setTurnNumber(prev => prev + 1);
  };`,
  `  const nextTurn = () => {
    setSelectedElement(null);
    setCurrentQuestion(null);
    setActiveCardMode(null);
    setFeedback(null);
    setAttackPower(1);
    
    let nextTeam = currentTurn === 'blue' ? 'red' : 'blue';
    
    // Check if next team is frozen
    setTurnFreeze(prevFreeze => {
      const nextFreeze = { ...prevFreeze };
      if (nextFreeze[nextTeam] > 0) {
        nextFreeze[nextTeam] -= 1;
        // Next team is frozen, current team goes again
        setCurrentTurn(currentTurn);
      } else {
        setCurrentTurn(nextTeam);
      }
      return nextFreeze;
    });

    setTurnNumber(prev => prev + 1);
  };`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched nextTurn");
