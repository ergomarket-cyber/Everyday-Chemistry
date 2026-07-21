const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jennyName = "Jenny @ Thu Thu Han";
  
  // Find Jenny
  const jenny = await prisma.student.findFirst({ where: { name: jennyName } });
  if (!jenny) {
    console.log("Jenny not found!");
    return;
  }
  
  // Assign Jenny as captain of team 11_2
  await prisma.student.update({
    where: { id: jenny.id },
    data: { teamId: "11_2", isCaptain: true }
  });
  console.log("Jenny is now captain of team 11_2 (Acidic Beats)!");
  
  // Optional: Demote anyone else who is captain in 11_2 to prevent conflicts
  const otherCaptains = await prisma.student.findMany({
    where: { teamId: "11_2", isCaptain: true, id: { not: jenny.id } }
  });
  
  for (const cap of otherCaptains) {
    await prisma.student.update({
      where: { id: cap.id },
      data: { isCaptain: false, teamId: null }
    });
    console.log(`Demoted ${cap.name} from captain to unassigned.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
