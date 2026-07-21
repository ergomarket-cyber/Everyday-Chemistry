const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Students:', await prisma.student.findMany({where: {name: {contains: 'Jenny'}}}));
  console.log('Teams:', await prisma.team.findMany());
}
main().finally(() => prisma.$disconnect());
