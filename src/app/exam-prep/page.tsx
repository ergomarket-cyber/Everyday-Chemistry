import { prisma } from '@/lib/prisma';
import ExamPrepClient from './ExamPrepClient';

export const dynamic = 'force-dynamic';

export default async function ExamPrepPage() {
  // Fetch hierarchy
  const topics = await prisma.topic.findMany({
    include: {
      subtopics: {
        include: {
          questions: {
            select: { id: true }
          }
        }
      }
    },
    orderBy: {
      name: 'asc' // Not exactly syllabus order but good enough for MVP, or we can leave as is
    }
  });

  // Sort to match syllabus roughly
  const order = ['Principles of Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Organic Chemistry'];
  topics.sort((a, b) => {
    let ia = order.indexOf(a.name);
    let ib = order.indexOf(b.name);
    if(ia === -1) ia = 99;
    if(ib === -1) ib = 99;
    return ia - ib;
  });

  // Fetch students for login
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      grade: true
    }
  });
  
  const students10 = students.filter(s => s.grade === 10).sort((a, b) => a.name.localeCompare(b.name));
  const students11 = students.filter(s => s.grade === 11).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ExamPrepClient 
      topics={topics} 
      students10={students10} 
      students11={students11} 
    />
  );
}
