import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GRADE_10_TEAMS = [
  {
    id: "10_1",
    grade: 10,
    name: "Alkali Boyz",
    song: "Highly Reactive",
    topic: "Group 1 Metals",
    color: "from-rose-500 to-orange-500",
    avatar: "💥",
    members: ["Ivan Ivanov", "Maria Smirnova", "Petr Petrov", "Anna Sokolova", "Dmitry Volkov", "Yulia Popova"],
    audioUrl: "/audio/alkali-boyz.mp3",
    lyrics: "Drop it in water, watch the fizz and the pop\nAlkali metals, we're never gonna stop\nLithium, Sodium, Potassium too\nOne valence electron, we're coming for you!\nHighly reactive, we explode on the scene\nMost energetic group that you've ever seen."
  },
  {
    id: "10_2",
    grade: 10,
    name: "Noble Flow",
    song: "Full Outer Shell",
    topic: "Group 8 Elements",
    color: "from-cyan-400 to-blue-600",
    avatar: "🧊",
    members: ["Maksim Lebedev", "Ekaterina Novikova", "Artem Kozlov", "Daria Morozova", "Mikhail Egorov", "Polina Volkova"],
    audioUrl: "/audio/noble-flow.mp3",
    lyrics: "I'm feeling so stable, full outer shell\nDon't need to bond, yeah I'm doing quite well\nHelium, Neon, Argon so bright\nLighting up signs in the middle of the night\nUnreactive, chillin' on my own\nThe king of the table, sitting on the throne."
  },
  {
    id: "10_3",
    grade: 10,
    name: "The Halogens",
    song: "Toxic Love",
    topic: "Group 7 Elements",
    color: "from-emerald-400 to-green-600",
    avatar: "☠️",
    members: ["Nikita Pavlov", "Anastasia Stepanova", "Egor Nikolaev", "Victoria Orlova", "Daniil Andreev", "Elizaveta Makarova"],
    audioUrl: "/audio/the-halogens.mp3",
    lyrics: "Seven electrons, just need one more\nStealing your electrons, knocking at your door\nFluorine, Chlorine, snatching them fast\nCreating a bond that is built to last\nDiatomic molecules, floating in pairs\nWe're the non-metals causing all of the scares."
  },
  {
    id: "10_4",
    grade: 10,
    name: "Transition Crew",
    song: "Colorful States",
    topic: "Transition Metals",
    color: "from-purple-500 to-pink-500",
    avatar: "🌈",
    members: ["Kirill Zakharov", "Ksenia Zaytseva", "Ilya Borisov", "Alisa Romanova", "Roman Tarasov", "Yana Yakovleva", "Vladislav Kiselev"],
    audioUrl: "/audio/transition-crew.mp3",
    lyrics: "Hard and dense, with high melting points\nBuilding the bridges and fixing the joints\nIron and Copper, changing our states\nVariable oxidation, we dictate the rates\nMaking those colors, solutions so bright\nCatalysts speeding the reaction right."
  }
];

const GRADE_11_TEAMS = [
  {
    id: "11_1",
    grade: 11,
    name: "Carbon Cartel",
    song: "Organic Dreams",
    topic: "Organic Chemistry",
    color: "from-zinc-500 to-slate-800",
    avatar: "💎",
    members: [
      "Andric @ Sai Lao Hseng",
      "Ben @ Bhone Myat Hein",
      "Edward @ Bhone Myint Myat",
      "Edwin @ Bhone Min Myat",
      "Emiko @ Htet Eaindray Lin",
      "Estrella @ Arkar Shoon Lae",
      "Gloria @ Myat Akari Aung"
    ],
    audioUrl: "/audio/carbon-cartel.mp3",
    lyrics: "Four valence electrons, building the chains\nCarbon is the king running through your veins\nAlkanes, Alkenes, Alkynes in the mix\nCovalent bonding doing all the tricks\nFrom diamonds to graphite, we change the form\nOrganic chemistry taking it by storm."
  },
  {
    id: "11_2",
    grade: 11,
    name: "Acidic Beats",
    song: "Low pH",
    topic: "Acids & Bases",
    color: "from-lime-400 to-green-600",
    avatar: "🧪",
    members: [
      "Grace @ Theint Thiri Zaw",
      "Harry @ Hein Htet Aung",
      "Jenny @ Thu Thu Han",
      "Joseph @ Nyan Phone Pyae",
      "Kyle @ Kaung Su Moe",
      "Laura @ Khaun Lum",
      "Louisa @ May Phoo Pyae San"
    ],
    audioUrl: "/audio/acidic-beats.mp3",
    lyrics: "Donating protons, dropping the pH\nLitmus turning red, getting in your face\nStrong acids ionizing all the way through\nNeutralize with a base, making water for you\nTitration station, drop by drop we see\nThe color changing point of chemistry."
  },
  {
    id: "11_3",
    grade: 11,
    name: "Quantum Leaps",
    song: "Orbitals",
    topic: "Atomic Structure",
    color: "from-indigo-400 to-purple-700",
    avatar: "⚛️",
    members: [
      "Mai @ Nu Yin",
      "Martin @ Aung Yadanar Gyi",
      "Max @ Zaw Min Oo",
      "Michelle @ Myat Yati Phyo",
      "Napolean @ Kyaw Zaww Nyi Nyi",
      "Nitish @ Min Thar Ki Kyaw",
      "Richard @ Phone Myat Min",
      "Ruby Moe @ Padamyar Shwe Yi Htet"
    ],
    audioUrl: "/audio/quantum-leaps.mp3",
    lyrics: "S, P, D, F, filling up the space\nElectrons moving at a crazy pace\nProbability clouds where they might be found\nQuantum mechanics spinning all around\nEnergy levels going up and down\nHeisenberg uncertainty wears the crown."
  },
  {
    id: "11_4",
    grade: 11,
    name: "The Catalysts",
    song: "Activation",
    topic: "Rates of Reaction",
    color: "from-amber-400 to-orange-600",
    avatar: "🔥",
    members: [
      "Sam @ Aung Moe Khaing",
      "Skylar @ Wai Yan Thant",
      "Steven @ Zeya Bhone Pyae",
      "Susanna @ Yoon Su",
      "Tera @ Thet Hmue Zin",
      "Theodore @ Thiha Thaw",
      "Violet @ Yoon Yoon Lin",
      "@ Bhone Myat Naing"
    ],
    audioUrl: "/audio/the-catalysts.mp3",
    lyrics: "Lowering the barrier, speeding up the rate\nProviding a pathway that's completely great\nWe don't get used up, we just help it go\nIncreasing the frequency of the collision flow\nTemperature and surface area do their part\nBut the catalyst is where the magic starts."
  }
];

const ALL_TEAMS = [...GRADE_10_TEAMS, ...GRADE_11_TEAMS];

// Generate a simple 4-digit PIN deterministically for the same user, or randomly. 
// Let's use deterministic for now so the teacher can see them in output and they don't change on re-seed.
function generatePin(name: string, grade: number): string {
  // Simple hash to get 4 digits
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  return (positiveHash % 9000 + 1000).toString(); // 1000-9999
}

async function main() {
  console.log('Clearing database...');
  await prisma.vote.deleteMany();
  await prisma.teacherVote.deleteMany();
  await prisma.student.deleteMany();
  await prisma.team.deleteMany();

  console.log('Seeding teams and students...');
  const studentPins: {name: string, grade: number, pin: string, team: string}[] = [];

  for (const team of ALL_TEAMS) {
    const { members, ...teamData } = team;
    
    await prisma.team.create({
      data: teamData
    });

    for (let i = 0; i < members.length; i++) {
      const memberName = members[i];
      const isCaptain = i === 0;
      const pin = generatePin(memberName, team.grade);
      studentPins.push({ name: memberName, grade: team.grade, pin, team: team.name, isCaptain } as any);
      
      await prisma.student.create({
        data: {
          name: memberName,
          grade: team.grade,
          pin,
          teamId: team.id,
          isCaptain
        }
      });
    }
  }

  console.log('\n--- STUDENT PINS ---');
  // Sort by grade, then by name
  studentPins.sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
  
  let currentGrade = 0;
  for (const s of studentPins) {
    if (s.grade !== currentGrade) {
      console.log(`\nGrade ${s.grade}:`);
      currentGrade = s.grade;
    }
    console.log(`${s.name.padEnd(25)} | PIN: ${s.pin} | Team: ${s.team}`);
  }
  console.log('--------------------\n');
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
