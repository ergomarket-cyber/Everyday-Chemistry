import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// We will use gemini-1.5-flash as the default model since it's fast and excellent at text grading.
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
