const fs = require('fs');
const path = require('path');

const questionsData = JSON.parse(fs.readFileSync('src/data/battle_questions.json', 'utf8'));

let markdown = `# Список вопросов для Periodic Battle\n\n`;

const hardPools = ['type_5_compare_elements', 'type_6_periodic_trends', 'type_7_visual_error_challenge'];
const normalPools = ['type_1_multiple_choice', 'type_2_short_answer', 'type_3_electron_configuration', 'type_4_position_on_periodic_table'];

let normalQuestions = [];
let hardQuestions = [];

for (const key of normalPools) {
    if (questionsData.questionDatabase[key] && questionsData.questionDatabase[key].pool) {
        normalQuestions.push(...questionsData.questionDatabase[key].pool.map(q => ({...q, type: key})));
    }
}

for (const key of hardPools) {
    if (questionsData.questionDatabase[key] && questionsData.questionDatabase[key].pool) {
        hardQuestions.push(...questionsData.questionDatabase[key].pool.map(q => ({...q, type: key})));
    }
}

markdown += `## Обычные вопросы (Normal Difficulty)\n`;
markdown += `Используются при обычных атаках на нейтральные клетки (1x).\n\n`;
markdown += `Всего вопросов: ${normalQuestions.length}\n\n`;

normalQuestions.forEach(q => {
    markdown += `### [${q.element}] ${q.q}\n`;
    markdown += `- **Правильный ответ:** ${q.a}\n`;
    if (q.opts && q.opts.length > 0) {
        markdown += `- **Варианты ответов:** ${q.opts.join(', ')}\n`;
    }
    markdown += `- *Тип:* ${q.type}\n\n`;
});

markdown += `## Сложные вопросы (Hard Difficulty)\n`;
markdown += `Используются при Overtake (захват вражеской клетки) и при Multi-Attack (2x, 3x).\n\n`;
markdown += `Всего вопросов: ${hardQuestions.length}\n\n`;

hardQuestions.forEach(q => {
    markdown += `### [${q.element}] ${q.q}\n`;
    markdown += `- **Правильный ответ:** ${q.a}\n`;
    if (q.opts && q.opts.length > 0) {
        markdown += `- **Варианты ответов:** ${q.opts.join(', ')}\n`;
    }
    markdown += `- *Тип:* ${q.type}\n\n`;
});

const artifactPath = '/Users/mogilevandrei/.gemini/antigravity-ide/brain/4be8bac7-d5b0-4159-ba78-ab91124f48f0/questions_list.md';
fs.writeFileSync(artifactPath, markdown);
console.log('Artifact created at ' + artifactPath);
