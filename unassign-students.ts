import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Unassigning non-captain students...');
    const result = await prisma.$executeRawUnsafe(`UPDATE "Student" SET "teamId" = NULL WHERE "isCaptain" = false;`);
    console.log(`Unassigned ${result} students.`);
    
    // Check if team 11_4 exists
    const team114 = await prisma.team.findUnique({ where: { id: "11_4" } });
    if (!team114) {
      console.log('Team 11_4 missing! We should re-add it or recreate it.');
    } else {
      console.log('Team 11_4 exists.');
    }

  } catch (e) {
    console.log('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
