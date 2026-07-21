import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Running SQL...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ALTER COLUMN "teamId" DROP NOT NULL;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Team" ADD COLUMN "isRosterLocked" BOOLEAN NOT NULL DEFAULT false;`);
    console.log('Success!');
  } catch (e) {
    console.log('Error or already updated:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
