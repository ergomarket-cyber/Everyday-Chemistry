const fs = require("fs");
const json = JSON.parse(fs.readFileSync("src/data/battle_questions.json", "utf8"));

function generateDistractors(q) {
  const ans = String(q.a).trim();
  
  // Custom manual mappings for better distractors
  if (q.id === "sa1" && ans === "6") return ["6", "12", "14", "4"];
  if (q.id === "sa2" && ans === "Mg") return ["Mg", "Mn", "Ma", "Mo"];
  // For EC
  if (ans === "2,8,1") return ["2,8,1", "2,8,2", "2,8", "2,8,8,1"];
  if (ans === "Chlorine") return ["Chlorine", "Fluorine", "Argon", "Oxygen"];
  if (ans === "2,8,3") return ["2,8,3", "2,8,2", "2,3", "3,8,2"];
  if (ans === "2,8") return ["2,8", "2,8,8", "2,2", "8,2"];
  
  // Generic numeric distractors
  if (!isNaN(ans) && ans.length < 3) {
    const n = parseInt(ans);
    return [String(n), String(n-1 || 1), String(n+1), String(n+2)].sort(() => 0.5 - Math.random());
  }

  // Generic strings
  return [ans, ans + " (Isotope)", ans + " (Ion)", "None of the above"];
}

// Ensure all questions have opts
for (const key in json.questionDatabase) {
  const type = json.questionDatabase[key];
  type.pool.forEach(q => {
    if (!q.opts) {
      if (q.id === "sa3" && q.a === "O") q.opts = ["O", "Os", "Ox", "O2"];
      else if (q.id === "sa4" && q.a === "1") q.opts = ["1", "2", "0", "4"];
      else if (q.id === "sa5" && q.a === "Iron") q.opts = ["Iron", "Iodine", "Indium", "Iridium"];
      else if (q.id === "sa6" && q.a === "2") q.opts = ["2", "1", "4", "8"];
      else if (q.id === "sa7" && q.a === "K") q.opts = ["K", "Po", "Kr", "Ka"];
      else if (q.id === "sa8" && q.a === "3") q.opts = ["3", "1", "5", "13"];
      else if (q.id === "sa9" && q.a === "Ag") q.opts = ["Ag", "Au", "Ar", "Al"];
      else if (q.id === "sa10" && q.a === "8") q.opts = ["8", "16", "6", "4"];
      
      else if (q.id === "ec3" && q.a === "2,8,3") q.opts = ["2,8,3", "2,8,2", "2,8,4", "3,8,2"];
      else if (q.id === "ec4" && q.a === "Neon") q.opts = ["Neon", "Argon", "Fluorine", "Nitrogen"];
      else if (q.id === "ec5" && q.a === "2,8,8,2") q.opts = ["2,8,8,2", "2,8,2", "2,8,8,1", "2,8,8"];
      else if (q.id === "ec6" && q.a === "Phosphorus") q.opts = ["Phosphorus", "Sulfur", "Nitrogen", "Silicon"];
      else if (q.id === "ec7" && q.a === "2,8,6") q.opts = ["2,8,6", "2,8,4", "2,8,8", "2,6"];
      else if (q.id === "ec8" && q.a === "Magnesium") q.opts = ["Magnesium", "Calcium", "Sodium", "Aluminum"];
      else if (q.id === "ec9" && q.a === "2,4") q.opts = ["2,4", "2,8,4", "4,2", "2,6"];
      else if (q.id === "ec10" && q.a === "Argon") q.opts = ["Argon", "Neon", "Chlorine", "Krypton"];
      
      else if (q.id === "pos1" && q.a === "Period 2, Group 6") q.opts = ["Period 2, Group 6", "Period 3, Group 6", "Period 2, Group 4", "Period 1, Group 6"];
      else if (q.id === "pos2" && q.a === "1") q.opts = ["1", "2", "3", "4"];
      else if (q.id === "pos3" && q.a === "Helium") q.opts = ["Helium", "Hydrogen", "Neon", "Lithium"];
      else if (q.id === "pos4" && q.a === "Period 3, Group 7") q.opts = ["Period 3, Group 7", "Period 2, Group 7", "Period 3, Group 5", "Period 4, Group 7"];
      else if (q.id === "pos5" && q.a === "Transition Metals") q.opts = ["Transition Metals", "Alkali Metals", "Alkaline Earth Metals", "Halogens"];
      else if (q.id === "pos6" && q.a === "2") q.opts = ["2", "1", "3", "4"];
      else if (q.id === "pos7" && q.a === "Boron") q.opts = ["Boron", "Carbon", "Aluminum", "Beryllium"];
      else if (q.id === "pos8" && q.a === "Period 4, Group 1") q.opts = ["Period 4, Group 1", "Period 3, Group 1", "Period 4, Group 2", "Period 5, Group 1"];
      else if (q.id === "pos9" && q.a === "Noble Gases") q.opts = ["Noble Gases", "Halogens", "Transition Metals", "Non-metals"];
      else if (q.id === "pos10" && q.a === "7") q.opts = ["7", "5", "6", "8"];
      
      else if (q.id === "comp1" && q.a === "Lithium") q.opts = ["Lithium", "Sodium", "Potassium", "Rubidium"];
      else if (q.id === "comp2" && q.a === "Fluorine") q.opts = ["Fluorine", "Chlorine", "Bromine", "Iodine"];
      else if (q.id === "comp3" && q.a === "Silicon") q.opts = ["Silicon", "Carbon", "Phosphorus", "Aluminum"];
      else if (q.id === "comp4" && q.a === "Aluminum") q.opts = ["Aluminum", "Magnesium", "Silicon", "Boron"];
      else if (q.id === "comp5" && q.a === "Helium") q.opts = ["Helium", "Neon", "Argon", "Hydrogen"];
      else if (q.id === "comp6" && q.a === "Sodium") q.opts = ["Sodium", "Magnesium", "Potassium", "Aluminum"];
      else if (q.id === "comp7" && q.a === "Nitrogen") q.opts = ["Nitrogen", "Oxygen", "Carbon", "Phosphorus"];
      else if (q.id === "comp8" && q.a === "Calcium") q.opts = ["Calcium", "Magnesium", "Potassium", "Strontium"];
      else if (q.id === "comp9" && q.a === "Sulfur") q.opts = ["Sulfur", "Oxygen", "Phosphorus", "Chlorine"];
      else if (q.id === "comp10" && q.a === "Neon") q.opts = ["Neon", "Fluorine", "Argon", "Sodium"];
      
      else if (q.id === "trend1" && q.a === "Increases") q.opts = ["Increases", "Decreases", "Stays the same", "Fluctuates randomly"];
      else if (q.id === "trend2" && q.a === "Decreases") q.opts = ["Decreases", "Increases", "Stays the same", "Increases then decreases"];
      else if (q.id === "trend3" && q.a === "Increases") q.opts = ["Increases", "Decreases", "Stays the same", "Fluctuates randomly"];
      else if (q.id === "trend4" && q.a === "Decreases") q.opts = ["Decreases", "Increases", "Stays the same", "Increases then decreases"];
      else if (q.id === "trend5" && q.a === "Stays the same") q.opts = ["Stays the same", "Increases", "Decreases", "Increases then decreases"];
      else if (q.id === "trend6" && q.a === "Increases") q.opts = ["Increases", "Decreases", "Stays the same", "Fluctuates randomly"];
      else if (q.id === "trend7" && q.a === "Decreases") q.opts = ["Decreases", "Increases", "Stays the same", "Increases then decreases"];
      else if (q.id === "trend8" && q.a === "Increases") q.opts = ["Increases", "Decreases", "Stays the same", "Fluctuates randomly"];
      else if (q.id === "trend9" && q.a === "Decreases") q.opts = ["Decreases", "Increases", "Stays the same", "Increases then decreases"];
      else if (q.id === "trend10" && q.a === "Stays the same") q.opts = ["Stays the same", "Increases", "Decreases", "Increases then decreases"];
      
      else q.opts = generateDistractors(q);
      
      // Shuffle them
      q.opts.sort(() => 0.5 - Math.random());
    }
  });
}

// Add New Questions based on User Request
// Ions, Bonds, Noble Gases
const mcPool = json.questionDatabase.type_1_multiple_choice.pool;

mcPool.push({
  "id": "mc_ion_1",
  "element": "Na",
  "q": "What charge does a Sodium (Na) ion typically form?",
  "opts": ["+1", "+2", "-1", "-2"],
  "a": "+1",
  "desc": "Sodium is in Group 1, so it loses 1 valence electron to achieve a full outer shell, forming a Na+ ion."
});

mcPool.push({
  "id": "mc_ion_2",
  "element": "O",
  "q": "What charge does an Oxygen (O) ion typically form?",
  "opts": ["-2", "-1", "+2", "+6"],
  "a": "-2",
  "desc": "Oxygen is in Group 6. It gains 2 electrons to complete its octet, forming an O2- ion."
});

mcPool.push({
  "id": "mc_ion_3",
  "element": "Al",
  "q": "What is the charge of an Aluminum (Al) ion?",
  "opts": ["+3", "+1", "-3", "-1"],
  "a": "+3",
  "desc": "Aluminum is in Group 3, so it loses 3 electrons to achieve stability, forming Al3+."
});

mcPool.push({
  "id": "mc_ion_4",
  "element": "Cl",
  "q": "What charge does a Chlorine (Cl) ion typically form?",
  "opts": ["-1", "-2", "+1", "+7"],
  "a": "-1",
  "desc": "Chlorine is in Group 7 (Halogens) and gains 1 electron to form a Cl- ion."
});

mcPool.push({
  "id": "mc_bond_1",
  "element": "C",
  "q": "What type of bonding does Carbon (C) typically form in compounds like CO2?",
  "opts": ["Covalent", "Ionic", "Metallic", "Hydrogen"],
  "a": "Covalent",
  "desc": "Carbon is a non-metal and typically shares electrons to form covalent bonds."
});

mcPool.push({
  "id": "mc_bond_2",
  "element": "Mg",
  "q": "When Magnesium (Mg) reacts with Oxygen, what type of bond is formed?",
  "opts": ["Ionic", "Covalent", "Metallic", "Polar Covalent"],
  "a": "Ionic",
  "desc": "Magnesium (metal) transfers electrons to Oxygen (non-metal), forming an ionic bond."
});

mcPool.push({
  "id": "mc_noble_1",
  "element": "Ne",
  "q": "Why is Neon (Ne) completely unreactive?",
  "opts": ["It has a full outer electron shell", "It is a gas at room temperature", "It forms covalent bonds easily", "It is lighter than air"],
  "a": "It has a full outer electron shell",
  "desc": "Noble gases like Neon have a completely full valence shell (stable octet), so they do not need to lose, gain, or share electrons."
});

mcPool.push({
  "id": "mc_noble_2",
  "element": "Ar",
  "q": "Which of the following explains Argon's lack of chemical reactivity?",
  "opts": ["It has 8 valence electrons", "It is a transition metal", "It has equal numbers of protons and neutrons", "It has a low boiling point"],
  "a": "It has 8 valence electrons",
  "desc": "Argon has 8 valence electrons (a full octet), making it a stable, unreactive noble gas."
});

// Write it back
fs.writeFileSync("src/data/battle_questions.json", JSON.stringify(json, null, 2));
console.log("Updated questions and added opts.");
