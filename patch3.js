const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `        // Capture element
        setElementStates(states => ({
          ...states,
          [selectedElement.number]: { owner: currentTurn }
        }));`,
  `        // Capture element + multi-attack bonuses
        const usedPower = currentQuestion.usedAttackPower || 1;
        setElementStates(states => {
          const nextStates = { ...states, [selectedElement.number]: { owner: currentTurn } };
          if (usedPower > 1) {
            let currentOwned = elementsData.elements.filter(e => nextStates[e.number]?.owner === currentTurn);
            for (let i = 0; i < usedPower - 1; i++) {
              const available = elementsData.elements.filter(e => !nextStates[e.number]?.owner && currentOwned.some(o => {
                const dx = Math.abs(o.xpos - e.xpos);
                const dy = Math.abs(o.ypos - e.ypos);
                return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
              }));
              if (available.length > 0) {
                const chosen = available[Math.floor(Math.random() * available.length)];
                nextStates[chosen.number] = { owner: currentTurn };
                next[currentTurn].score += 100;
                currentOwned.push(chosen);
              }
            }
          }
          return nextStates;
        });`
);

code = code.replace(
  `      } else {
        next[currentTurn].streak = 0;
        if (isOvertake) {
          next[currentTurn].score -= 100;
          next[rival].score += 100;
        }
      }`,
  `      } else {
        next[currentTurn].streak = 0;
        if (isOvertake) {
          next[currentTurn].score -= 100;
          next[rival].score += 100;
        }
        const usedPower = currentQuestion.usedAttackPower || 1;
        if (usedPower > 1) {
          setTurnFreeze(pf => ({ ...pf, [currentTurn]: pf[currentTurn] + (usedPower - 1) }));
        }
      }`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched handleAnswer");
