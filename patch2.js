const fs = require('fs');
let code = fs.readFileSync('src/app/games/periodic-battle/page.tsx', 'utf8');

code = code.replace(
  `  const getRandomQuestion = (element: Element, isOvertake: boolean) => {
    const qdb = battleQuestions.questionDatabase as any;
    const pools = isOvertake `,
  `  const getRandomQuestion = (element: Element, isOvertake: boolean, useHardPool: boolean = false) => {
    const qdb = battleQuestions.questionDatabase as any;
    const pools = (isOvertake || useHardPool) `
);

code = code.replace(
  `    const isOvertake = !!state?.owner;
    let question = getRandomQuestion(element, isOvertake);`,
  `    const isOvertake = !!state?.owner;
    let question = getRandomQuestion(element, isOvertake, attackPower > 1);`
);

code = code.replace(
  `    setSelectedElement(element);
    setCurrentQuestion({ ...question, isOvertake });
    setTimeLeft(isOvertake ? 15 : 30);`,
  `    setSelectedElement(element);
    setCurrentQuestion({ ...question, isOvertake, usedAttackPower: attackPower });
    setTimeLeft(isOvertake || attackPower > 1 ? 15 : 30);`
);

fs.writeFileSync('src/app/games/periodic-battle/page.tsx', code);
console.log("Patched click logic");
