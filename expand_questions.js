const fs = require("fs");
const json = JSON.parse(fs.readFileSync("src/data/battle_questions.json", "utf8"));

const elements = [
  { name: "Hydrogen", sym: "H", num: 1, group: 1, period: 1, ec: "1", type: "Non-metal" },
  { name: "Helium", sym: "He", num: 2, group: 8, period: 1, ec: "2", type: "Noble Gas" },
  { name: "Lithium", sym: "Li", num: 3, group: 1, period: 2, ec: "2,1", type: "Alkali Metal" },
  { name: "Beryllium", sym: "Be", num: 4, group: 2, period: 2, ec: "2,2", type: "Alkaline Earth Metal" },
  { name: "Boron", sym: "B", num: 5, group: 3, period: 2, ec: "2,3", type: "Metalloid" },
  { name: "Carbon", sym: "C", num: 6, group: 4, period: 2, ec: "2,4", type: "Non-metal" },
  { name: "Nitrogen", sym: "N", num: 7, group: 5, period: 2, ec: "2,5", type: "Non-metal" },
  { name: "Oxygen", sym: "O", num: 8, group: 6, period: 2, ec: "2,6", type: "Non-metal" },
  { name: "Fluorine", sym: "F", num: 9, group: 7, period: 2, ec: "2,7", type: "Halogen" },
  { name: "Neon", sym: "Ne", num: 10, group: 8, period: 2, ec: "2,8", type: "Noble Gas" },
  { name: "Sodium", sym: "Na", num: 11, group: 1, period: 3, ec: "2,8,1", type: "Alkali Metal" },
  { name: "Magnesium", sym: "Mg", num: 12, group: 2, period: 3, ec: "2,8,2", type: "Alkaline Earth Metal" },
  { name: "Aluminium", sym: "Al", num: 13, group: 3, period: 3, ec: "2,8,3", type: "Metal" },
  { name: "Silicon", sym: "Si", num: 14, group: 4, period: 3, ec: "2,8,4", type: "Metalloid" },
  { name: "Phosphorus", sym: "P", num: 15, group: 5, period: 3, ec: "2,8,5", type: "Non-metal" },
  { name: "Sulfur", sym: "S", num: 16, group: 6, period: 3, ec: "2,8,6", type: "Non-metal" },
  { name: "Chlorine", sym: "Cl", num: 17, group: 7, period: 3, ec: "2,8,7", type: "Halogen" },
  { name: "Argon", sym: "Ar", num: 18, group: 8, period: 3, ec: "2,8,8", type: "Noble Gas" },
  { name: "Potassium", sym: "K", num: 19, group: 1, period: 4, ec: "2,8,8,1", type: "Alkali Metal" },
  { name: "Calcium", sym: "Ca", num: 20, group: 2, period: 4, ec: "2,8,8,2", type: "Alkaline Earth Metal" }
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

let saCount = 100;
function genSa() {
  const el = rand(elements);
  const type = rand(["sym", "num", "name"]);
  if (type === "sym") {
    const distractors = shuffle(elements.filter(e => e.sym !== el.sym).map(e => e.sym)).slice(0, 3);
    return { id: `gen_sa_${saCount++}`, element: el.sym, q: `What is the chemical symbol for ${el.name}?`, a: el.sym, opts: shuffle([el.sym, ...distractors]), desc: `${el.name} is represented by the symbol ${el.sym}.` };
  } else if (type === "num") {
    const wrongNums = [el.num-1 || 1, el.num+1, el.num+2, el.num+8, el.num-8].filter(n => n > 0 && n !== el.num);
    const distractors = shuffle(wrongNums).slice(0, 3);
    return { id: `gen_sa_${saCount++}`, element: el.sym, q: `What is the atomic number of ${el.name}?`, a: String(el.num), opts: shuffle([String(el.num), ...distractors.map(String)]), desc: `${el.name} has exactly ${el.num} protons.` };
  } else {
    const distractors = shuffle(elements.filter(e => e.name !== el.name).map(e => e.name)).slice(0, 3);
    return { id: `gen_sa_${saCount++}`, element: el.sym, q: `Which element is represented by the symbol ${el.sym}?`, a: el.name, opts: shuffle([el.name, ...distractors]), desc: `The symbol ${el.sym} stands for ${el.name}.` };
  }
}

let ecCount = 100;
function genEc() {
  const el = rand(elements);
  const type = rand(["find_ec", "find_el"]);
  if (type === "find_ec") {
    const distractors = shuffle(elements.filter(e => e.ec !== el.ec).map(e => e.ec)).slice(0, 3);
    return { id: `gen_ec_${ecCount++}`, element: el.sym, q: `What is the electron configuration of a neutral ${el.name} atom?`, a: el.ec, opts: shuffle([el.ec, ...distractors]), desc: `${el.name} has ${el.num} electrons arranged as ${el.ec}.` };
  } else {
    const distractors = shuffle(elements.filter(e => e.name !== el.name).map(e => e.name)).slice(0, 3);
    return { id: `gen_ec_${ecCount++}`, element: el.sym, q: `Which element has the electron configuration ${el.ec}?`, a: el.name, opts: shuffle([el.name, ...distractors]), desc: `The configuration ${el.ec} sums to ${el.num} electrons, which is ${el.name}.` };
  }
}

let posCount = 100;
function genPos() {
  const el = rand(elements);
  const distractors = shuffle(elements.filter(e => e.name !== el.name).map(e => e.name)).slice(0, 3);
  return { id: `gen_pos_${posCount++}`, element: el.sym, q: `Which element is located in Period ${el.period}, Group ${el.group}?`, a: el.name, opts: shuffle([el.name, ...distractors]), desc: `${el.name} has ${el.period} shells and ${el.group} valence electrons.` };
}

let compCount = 100;
function genComp() {
  // Compare reactivity of G1
  const g1 = elements.filter(e => e.group === 1 && e.num > 1);
  if (g1.length >= 2) {
    const e1 = rand(g1);
    const e2 = rand(g1.filter(e => e.sym !== e1.sym));
    const moreReactive = e1.num > e2.num ? e1 : e2;
    return { id: `gen_comp_${compCount++}`, element: moreReactive.sym, q: `Which is more reactive with water: ${e1.name} or ${e2.name}?`, a: moreReactive.name, opts: shuffle([e1.name, e2.name, "Both react equally", "Neither reacts"]), desc: `Reactivity increases down Group 1. ${moreReactive.name} is lower in the group.` };
  }
}

// Generate new pools
const newSa = Array.from({length: 40}, genSa);
const newEc = Array.from({length: 40}, genEc);
const newPos = Array.from({length: 40}, genPos);
const newComp = Array.from({length: 20}, genComp).filter(Boolean);

json.questionDatabase.type_2_short_answer.pool.push(...newSa);
json.questionDatabase.type_3_electron_configuration.pool.push(...newEc);
json.questionDatabase.type_4_position_on_periodic_table.pool.push(...newPos);
json.questionDatabase.type_5_compare_elements.pool.push(...newComp);

// Deduplicate by ID just in case
for (const k in json.questionDatabase) {
  const pool = json.questionDatabase[k].pool;
  const unique = [];
  const seen = new Set();
  for (const q of pool) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      unique.push(q);
    }
  }
  json.questionDatabase[k].pool = shuffle(unique);
}

fs.writeFileSync("src/data/battle_questions.json", JSON.stringify(json, null, 2));
console.log(`Added ${newSa.length} short answers, ${newEc.length} ECs, ${newPos.length} positions, ${newComp.length} comparisons.`);
