const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hierarchy = [
  {
    name: 'Principles of Chemistry',
    subtopics: [
      'States of matter',
      'Elements, compounds and mixtures',
      'Atomic structure',
      'The Periodic Table',
      'Chemical formulae, equations and calculations',
      'Ionic bonding',
      'Covalent bonding',
      'Metallic bonding',
      'Electrolysis'
    ]
  },
  {
    name: 'Inorganic Chemistry',
    subtopics: [
      'Group 1 (alkali metals)',
      'Group 7 (halogens)',
      'Gases in the atmosphere',
      'Reactivity series',
      'Extraction and uses of metals',
      'Acids, alkalis and titrations',
      'Acids, bases and salt preparations',
      'Chemical tests'
    ]
  },
  {
    name: 'Physical Chemistry',
    subtopics: [
      'Energetics',
      'Rates of reaction',
      'Reversible reactions and equilibria'
    ]
  },
  {
    name: 'Organic Chemistry',
    subtopics: [
      'Introduction to organic chemistry',
      'Crude oil',
      'Alkanes',
      'Alkenes',
      'Alcohols',
      'Carboxylic acids',
      'Esters',
      'Synthetic polymers'
    ]
  }
];

const seedQuestions = [
  {
    subtopicName: 'Rates of reaction',
    questionText: 'When a mixture of sulfur and zinc is heated to a high temperature a reaction occurs, forming the compound zinc sulfide, ZnS. Give a reason why the mixture of sulfur and zinc needs heating before a reaction occurs.',
    markSchemeText: 'The reaction has a high activation energy. (ALLOW: to give zinc and sulfur enough energy to react / speeds reaction up / reacts quicker / the reaction is very slow at room temperature. IGNORE: unreactive / does not react. ALLOW: gains kinetic energy)',
    maxMarks: 1
  },
  {
    subtopicName: 'Metallic bonding',
    questionText: 'Explain why magnesium metal is malleable.',
    markSchemeText: 'M1: layers (of atoms / ions)\nM2: (atoms/ions) can slide over one another.\n(ALLOW: particles. REJECT: references to intermolecular forces)',
    maxMarks: 2
  },
  {
    subtopicName: 'Alcohols',
    questionText: 'Ethanol can be manufactured by the fermentation of glucose. Explain why fermentation needs to be done in the absence of air.',
    markSchemeText: 'M1: oxygen in the air would react with ethanol\nM2: to form ethanoic acid\nOR\nM1: ethanol would not be formed\nM2: CO2 and H2O would form\n(ACCEPT: ethanol would be oxidised. ALLOW: to form carboxylic acid / vinegar)',
    maxMarks: 2
  },
  {
    subtopicName: 'Electrolysis',
    questionText: 'This apparatus is used to electrolyse a concentrated solution of sodium chloride. Give a reason why sodium chloride solution conducts electricity.',
    markSchemeText: 'Ions can move / are mobile. (OWTTE)',
    maxMarks: 1
  }
];

async function main() {
  console.log('Cleaning up existing data...');
  // Delete all to avoid constraint issues during development
  await prisma.studentAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.topic.deleteMany();

  console.log('Seeding Edexcel 4CH1 Hierarchy...');
  for (const topicData of hierarchy) {
    const topic = await prisma.topic.create({
      data: {
        name: topicData.name,
      }
    });

    for (const stName of topicData.subtopics) {
      await prisma.subtopic.create({
        data: {
          name: stName,
          topicId: topic.id
        }
      });
    }
  }

  console.log('Seeding questions mapped to subtopics...');
  for (const q of seedQuestions) {
    const st = await prisma.subtopic.findFirst({
      where: { name: q.subtopicName }
    });

    if (st) {
      await prisma.examQuestion.create({
        data: {
          subtopicId: st.id,
          questionText: q.questionText,
          markSchemeText: q.markSchemeText,
          maxMarks: q.maxMarks
        }
      });
    } else {
      console.warn(`Could not find subtopic: ${q.subtopicName}`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
