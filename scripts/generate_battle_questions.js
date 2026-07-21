const fs = require('fs');

const elementsData = JSON.parse(fs.readFileSync('./src/data/elements.json', 'utf8')).elements;

const generateQuestions = () => {
  const db = {
    gameConfig: {
      title: "Periodic Table Battle",
      teams: [
        { id: "blue", defaultName: "Alkali Boyz", color: "#00E5FF", startCell: "H" },
        { id: "red", defaultName: "Noble Flow", color: "#FF0055", startCell: "He" }
      ]
    },
    questionDatabase: {
      type_1_multiple_choice: { typeName: "Multiple Choice", pool: [] },
      type_2_short_answer: { typeName: "Short Answer", pool: [] },
      type_3_electron_configuration: { typeName: "Electron Configuration", pool: [] },
      type_4_position: { typeName: "Position on Periodic Table", pool: [] },
      type_5_compare: { typeName: "Compare Elements", pool: [] },
      type_6_trivia: { typeName: "Discovery & Trivia", pool: [] },
      type_7_hard: { typeName: "Advanced (Overtake)", pool: [] }
    }
  };

  const getEle = (sym) => elementsData.find(e => e.symbol === sym);

  const getElectronConfig = (num) => {
    if (num > 20) return null;
    let n = num;
    const shells = [];
    if (n > 0) { shells.push(Math.min(2, n)); n -= 2; }
    if (n > 0) { shells.push(Math.min(8, n)); n -= 8; }
    if (n > 0) { shells.push(Math.min(8, n)); n -= 8; }
    if (n > 0) { shells.push(Math.min(2, n)); n -= 2; }
    return shells.join(',');
  };

  elementsData.forEach(el => {
    db.questionDatabase.type_1_multiple_choice.pool.push({
      id: `mc_${el.symbol}`,
      element: el.symbol,
      q: `What is the correct chemical symbol for ${el.name}?`,
      a: el.symbol,
      opts: [el.symbol, el.symbol.substring(0,1) + 'x', el.symbol.toUpperCase() + 'y', 'Xz'].sort(() => 0.5 - Math.random()),
      desc: `${el.name} is represented by the symbol ${el.symbol}.`
    });

    db.questionDatabase.type_2_short_answer.pool.push({
      id: `sa_${el.symbol}`,
      element: el.symbol,
      q: `What is the atomic number of ${el.name}?`,
      a: el.number.toString(),
      desc: `${el.name} has ${el.number} protons.`
    });

    if (el.number <= 20) {
      db.questionDatabase.type_3_electron_configuration.pool.push({
        id: `ec_${el.symbol}`,
        element: el.symbol,
        q: `What is the standard electron configuration of a neutral ${el.name} atom?`,
        a: getElectronConfig(el.number),
        desc: `${el.name} has ${el.number} electrons.`
      });
    }

    if (el.group) {
      db.questionDatabase.type_4_position.pool.push({
        id: `pt_${el.symbol}`,
        element: el.symbol,
        q: `In which Group number is ${el.name} found?`,
        a: el.group.toString(),
        desc: `${el.name} is located in Group ${el.group}, Period ${el.period}.`
      });
    }

    if (el.discovered_by) {
      db.questionDatabase.type_6_trivia.pool.push({
        id: `tr_${el.symbol}`,
        element: el.symbol,
        q: `Who is credited with the discovery of ${el.name}?`,
        a: el.discovered_by,
        desc: `${el.name} was discovered by ${el.discovered_by}.`
      });
    }

    db.questionDatabase.type_7_hard.pool.push({
      id: `hd_${el.symbol}`,
      element: el.symbol,
      q: `What is the phase of ${el.name} at standard room temperature?`,
      a: el.phase,
      desc: `${el.name} is a ${el.phase.toLowerCase()} at room temperature.`
    });
  });

  fs.writeFileSync('./src/data/battle_questions.json', JSON.stringify(db, null, 2));
  console.log('Battle questions generated!');
};

generateQuestions();
