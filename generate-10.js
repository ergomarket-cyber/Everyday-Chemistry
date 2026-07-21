const students = [
  "Alex @ Bhone Myat Min",
  "Alice @ Su Lae Shwe Yee",
  "Arthur @ Aung Thura Kyaw",
  "Bipasha @ Hnin Wati Yoon",
  "Cindy @ Chaw Mon Thant",
  "Ellis @ Haw Yone Shin",
  "Hanna @ Zayar Shoon Pyae Thar",
  "Hannah @ Thin Myat Noe",
  "Irene @ Nang Seng Moon",
  "Jason @ Paing Min Thant",
  "Jewellin @ Shwe Yi Lin Latt",
  "John @ Kaung Sat Thein",
  "Justin @ Thiha Lin Thant",
  "Mason @ Myat Min Thaw",
  "Mia @ Muyar Po Po",
  "Nathan @ San Myo Tun",
  "Nelson @ Kyaw Zaww Nge Htwe",
  "Patrick @ Paing Htoo Myat",
  "Phillip @ Nyan Lin Phyo",
  "Sam @ Swan Htet Paing",
  "Stanlie  @ Sai Shan Fon Mao",
  "Terry @ Hein Htet San",
  "Theo @ Khant Kyaw Swar",
  "Tiara @ Thet Thiri Shein",
  "Wilson @ Wunna Kyaw"
];

function generatePin(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 9000 + 1000).toString();
}

console.log('--- SQL FOR SUPABASE ---');
console.log('DELETE FROM "Student" WHERE grade = 10;');
console.log('UPDATE "Team" SET "isRosterLocked" = false WHERE grade = 10;');

let sql = `INSERT INTO "Student" (id, name, grade, pin, "isCaptain", "teamId") VALUES\n`;
let values = [];
let pins = [];

students.forEach((name, idx) => {
  const pin = generatePin(name);
  let isCaptain = false;
  let teamId = 'NULL';
  
  if (idx === 0) { isCaptain = true; teamId = "'10_1'"; }
  else if (idx === 1) { isCaptain = true; teamId = "'10_2'"; }
  else if (idx === 2) { isCaptain = true; teamId = "'10_3'"; }
  else if (idx === 3) { isCaptain = true; teamId = "'10_4'"; }
  
  values.push(`('std-10-${idx+1}', '${name.replace(/'/g, "''")}', 10, '${pin}', ${isCaptain}, ${teamId})`);
  pins.push(`${name.padEnd(30)} | PIN: ${pin} ${isCaptain ? '(Captain)' : ''}`);
});

console.log(sql + values.join(',\n') + ';');
console.log('\n\n--- PINS FOR 10TH GRADE ---');
console.log(pins.join('\n'));
