const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ select: { name: true, grade: true, teamId: true } });
  console.log("Total students: ", students.length);
  const unassigned = students.filter(s => !s.teamId);
  console.log("Unassigned: ", unassigned.length);
  console.log("Assigned: ", students.length - unassigned.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
