const fs = require('fs');
let code = fs.readFileSync('src/app/voting/page.tsx', 'utf8');

code = code.replace(
  `    audioUrl: t.audioUrl,
    members: t.members.map((s: any) => s.name)
  }));`,
  `    audioUrl: t.audioUrl,
    isRosterLocked: t.isRosterLocked,
    members: t.members.map((s: any) => s.name)
  }));`
);

code = code.replace(
  `  const students10 = students.filter(s => s.grade === 10).map(s => s.name).sort((a, b) => a.localeCompare(b));
  const students11 = students.filter(s => s.grade === 11).map(s => s.name).sort((a, b) => a.localeCompare(b));`,
  `  const students10 = students.filter(s => s.grade === 10).sort((a, b) => a.name.localeCompare(b.name));
  const students11 = students.filter(s => s.grade === 11).sort((a, b) => a.name.localeCompare(b.name));`
);

fs.writeFileSync('src/app/voting/page.tsx', code);
console.log("Patched page.tsx");
