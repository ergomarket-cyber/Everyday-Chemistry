const fs = require('fs');

const rawData = fs.readFileSync('src/data/elements.json', 'utf8');
const { elements } = JSON.parse(rawData);

const questions = [];

elements.forEach(el => {
  // Question about symbol
  questions.push({
    id: `sym_${el.number}`,
    element: el.symbol,
    topic: 'Symbols',
    difficulty: 'easy',
    question: `What is the chemical symbol for ${el.name}?`,
    answers: [el.symbol, el.symbol.substring(0, 1), el.symbol + 'x', el.name.substring(0, 2)],
    correct_answer: el.symbol,
    points: 1
  });

  // Question about atomic number
  questions.push({
    id: `num_${el.number}`,
    element: el.symbol,
    topic: 'Atomic Structure',
    difficulty: 'medium',
    question: `What is the atomic number of ${el.name}?`,
    answers: [el.number.toString(), (el.number + 1).toString(), (el.number - 1).toString(), (el.number + 2).toString()],
    correct_answer: el.number.toString(),
    points: 2
  });
  
  // Question about group
  if (el.group) {
    questions.push({
      id: `grp_${el.number}`,
      element: el.symbol,
      topic: 'Periodic Trends',
      difficulty: 'hard',
      question: `Which group does ${el.name} belong to?`,
      answers: [el.group.toString(), (el.group + 1).toString(), 'Transition', 'Halogen'],
      correct_answer: el.group.toString(),
      points: 3
    });
  }
});

// Shuffle answers
questions.forEach(q => {
  q.answers = [...new Set(q.answers)].sort(() => Math.random() - 0.5);
  // Ensure we have at least 4 answers, if not duplicate with random stuff
  while (q.answers.length < 4) {
    q.answers.push(`Option ${Math.floor(Math.random() * 100)}`);
    q.answers = [...new Set(q.answers)];
  }
  // limit to 4
  q.answers = q.answers.slice(0, 4);
  // Ensure correct answer is still in there
  if (!q.answers.includes(q.correct_answer)) {
    q.answers[0] = q.correct_answer;
    q.answers = q.answers.sort(() => Math.random() - 0.5);
  }
});

fs.writeFileSync('src/data/questions.json', JSON.stringify(questions, null, 2));
console.log(`Generated ${questions.length} questions`);
