const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Exam Questions...');

  const questions = [
    {
      topic: 'Kinetics & Energetics',
      questionText: 'When a mixture of sulfur and zinc is heated to a high temperature a reaction occurs, forming the compound zinc sulfide, ZnS. Give a reason why the mixture of sulfur and zinc needs heating before a reaction occurs.',
      markSchemeText: 'The reaction has a high activation energy. (ALLOW: to give zinc and sulfur enough energy to react / speeds reaction up / reacts quicker / the reaction is very slow at room temperature. IGNORE: unreactive / does not react. ALLOW: gains kinetic energy)',
      maxMarks: 1
    },
    {
      topic: 'Structure & Bonding',
      questionText: 'Explain why magnesium metal is malleable.',
      markSchemeText: 'M1: layers (of atoms / ions)\nM2: (atoms/ions) can slide over one another.\n(ALLOW: particles. REJECT: references to intermolecular forces)',
      maxMarks: 2
    },
    {
      topic: 'Organic Chemistry',
      questionText: 'Ethanol can be manufactured by the fermentation of glucose. Explain why fermentation needs to be done in the absence of air.',
      markSchemeText: 'M1: oxygen in the air would react with ethanol\nM2: to form ethanoic acid\nOR\nM1: ethanol would not be formed\nM2: CO2 and H2O would form\n(ACCEPT: ethanol would be oxidised. ALLOW: to form carboxylic acid / vinegar)',
      maxMarks: 2
    },
    {
      topic: 'Electrolysis',
      questionText: 'This apparatus is used to electrolyse a concentrated solution of sodium chloride. Give a reason why sodium chloride solution conducts electricity.',
      markSchemeText: 'Ions can move / are mobile. (OWTTE)',
      maxMarks: 1
    }
  ];

  for (const q of questions) {
    await prisma.examQuestion.create({
      data: q
    });
  }

  console.log('Successfully seeded exam questions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
