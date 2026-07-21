const fs = require('fs');
let code = fs.readFileSync('src/app/voting/page.tsx', 'utf8');

code = code.replace(
  `    select: {
      name: true,
      grade: true,
      teamId: true
    }`,
  `    select: {
      id: true,
      name: true,
      grade: true,
      teamId: true
    }`
);

fs.writeFileSync('src/app/voting/page.tsx', code);
console.log("Patched page.tsx again");
