const fs = require("fs");
const json = JSON.parse(fs.readFileSync("src/data/battle_questions.json", "utf8"));

function isElement(str) {
  const els = ["Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminium", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium", "Iodine", "Bromine"];
  return els.includes(str);
}

function getElementDistractors(str) {
  if (str === "Lithium") return ["Lithium", "Sodium", "Hydrogen", "Beryllium"];
  if (str === "Calcium") return ["Calcium", "Magnesium", "Potassium", "Argon"];
  if (str === "Sulfur") return ["Sulfur", "Oxygen", "Phosphorus", "Chlorine"];
  if (str === "Neon") return ["Neon", "Helium", "Argon", "Fluorine"];
  if (str === "Fluorine") return ["Fluorine", "Chlorine", "Oxygen", "Neon"];
  if (str === "Magnesium") return ["Magnesium", "Calcium", "Sodium", "Aluminium"];
  if (str === "Beryllium") return ["Beryllium", "Magnesium", "Boron", "Lithium"];
  if (str === "Potassium") return ["Potassium", "Sodium", "Calcium", "Rubidium"];
  if (str === "Iodine") return ["Iodine", "Bromine", "Chlorine", "Fluorine"];
  if (str === "Aluminium") return ["Aluminium", "Magnesium", "Silicon", "Boron"];
  if (str === "Helium") return ["Helium", "Hydrogen", "Neon", "Lithium"];
  
  return [str, "Carbon", "Nitrogen", "Oxygen"];
}

for (const key in json.questionDatabase) {
  const type = json.questionDatabase[key];
  type.pool.forEach(q => {
    if (q.opts && q.opts.some(o => typeof o === "string" && (o.includes("(Isotope)") || o.includes("(Ion)")))) {
      const ans = q.a.trim();
      
      let newOpts = [];
      if (isElement(ans)) {
        newOpts = getElementDistractors(ans);
      } else if (ans === "2,6") newOpts = ["2,6", "2,8,6", "2,4", "2,8"];
      else if (ans === "2,8,8") newOpts = ["2,8,8", "2,8,18,8", "2,8", "2,8,2"];
      else if (ans === "2,7") newOpts = ["2,7", "2,8,7", "2,5", "2,8"];
      else if (ans === "2,1") newOpts = ["2,1", "2,8,1", "2,3", "2,2"];
      else if (ans === "Mg2+") newOpts = ["Mg2+", "Na+", "Al3+", "Ca2+"];
      else if (ans === "They have full outer electron shells") newOpts = ["They have full outer electron shells", "They are all gases", "They are covalently bonded", "They have a high density"];
      else if (ans === "It decreases") newOpts = ["It decreases", "It increases", "It remains constant", "It fluctuates"];
      else if (ans === "Top right") newOpts = ["Top right", "Top left", "Bottom right", "Bottom left"];
      else if (ans === "Bottom left") newOpts = ["Bottom left", "Top right", "Bottom right", "Top left"];
      else if (ans === "They increase") newOpts = ["They increase", "They decrease", "They remain constant", "They fluctuate"];
      else if (ans === "They decrease") newOpts = ["They decrease", "They increase", "They remain constant", "They fluctuate"];
      else if (ans === "Number of protons increases") newOpts = ["Number of protons increases", "Number of neutrons increases", "Atomic radius increases", "Electron shielding increases"];
      else {
        // Fallback to random if I missed any
        newOpts = [ans, "Incorrect Option A", "Incorrect Option B", "Incorrect Option C"];
      }
      
      // Shuffle
      q.opts = newOpts.sort(() => 0.5 - Math.random());
    }
  });
}

fs.writeFileSync("src/data/battle_questions.json", JSON.stringify(json, null, 2));
console.log("Fixed bad opts.");
