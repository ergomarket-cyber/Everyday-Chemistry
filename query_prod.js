const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ 
    where: { grade: 11 },
    select: { name: true, teamId: true } 
  });
  
  const missing = ["Harry @ Hein Htet Aung", "Jenny @ Thu Thu Han", "Laura @ Khaun Lum", "Mai @ Nu Yin", "Nitish @ Min Thar Ki Kyaw", "Richard @ Phone Myat Min", "Ruby Moe @ Padamyar Shwe Yi Htet", "Sam @ Aung Moe Khaing"];
  
  for (const name of missing) {
     const s = students.find(x => x.name === name);
     console.log(name, "->", s ? s.teamId : "NOT FOUND IN DB");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
