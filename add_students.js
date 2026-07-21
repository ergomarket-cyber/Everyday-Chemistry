const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawStudents = `1 Andric @ Sai Lao Hseng
2 Ben @ Bhone Myat Hein 
3 Edward @ Bhone Myint Myat
4 Edwin @ Bhone Min Myat
5 Emiko @ Htet Eaindray Lin
6 Estrella @ Arkar Shoon Lae
7 Gloria @ Myat Akari Aung
8 Grace @ Theint Thiri Zaw
9 Harry @ Hein Htet Aung
10 Jenny @ Thu Thu Han
11 Joseph @ Nyan Phone Pyae
12 Kyle @ Kaung Su Moe
13 Laura @ Khaun Lum
14 Louisa @ May Phoo Pyae San
15 Mai @ Nu Yin
16 Martin @ Aung Yadanar Gyi
17 Max @ Zaw Min Oo
18 Michelle @ Myat Yati Phyo
19 Napolean @ Kyaw Zaww Nyi Nyi
20 Nitish @ Min Thar Ki Kyaw
21 Richard @ Phone Myat Min
22 Ruby Moe @ Padamyar Shwe Yi Htet
23 Sam @ Aung Moe Khaing
24 Skylar @ Wai Yan Thant
25 Steven @ Zeya Bhone Pyae
26 Susanna @ Yoon Su
27 Tera @ Thet Hmue Zin
28 Theodore @ Thiha Thaw
29 Violet @ Yoon Yoon Lin
30  @ Bhone Myat Naing`;

const students = rawStudents.split('\n').map(line => {
  // Remove the number at the beginning (e.g., "1 ")
  return line.replace(/^\d+\s*/, '').trim();
});

async function main() {
  for (let name of students) {
    if (name.startsWith('@ ')) {
        name = name.substring(2);
    }
    const existing = await prisma.student.findFirst({ where: { name } });
    if (!existing) {
      // Create random 4 digit PIN
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      await prisma.student.create({
        data: {
          name,
          grade: 11,
          pin
        }
      });
      console.log(`Added: ${name} (PIN: ${pin})`);
    } else {
      console.log(`Exists: ${name} - Skipping.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
