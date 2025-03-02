import { createClient } from "@libsql/client";
import * as fs from "fs";
// Use dynamic import for csv-parser in ES modules
import { createReadStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// For ES modules to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(dirname(__dirname), '.env') });

// Log environment variables to debug
console.log("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "Found" : "Not found");
console.log("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "Found" : "Not found");

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("Missing Turso database credentials. Please check your .env file.");
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function createTables() {
  const schema = `
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL,
      text TEXT NOT NULL,
      subject TEXT NOT NULL,
      exam_year INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      chapter TEXT,
      question_type TEXT NOT NULL,
      answer_key TEXT NOT NULL,
      correct_answer TEXT,
      explanation TEXT,
      page INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `;

  const statements = schema.split(';').filter(stmt => stmt.trim());
  for (const stmt of statements) {
    await client.execute({ sql: stmt, args: [] });
  }
}

async function insertQuestion(questionData: any): Promise<number> {
  const query = `
    INSERT INTO questions (
      number, text, subject, exam_year, exam_name, 
      question_type, answer_key, correct_answer, explanation, chapter, page
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `;

  const correctAnswer = questionData['Correct Answer'] || '';
  const answerKey = correctAnswer.startsWith('Option ') ? correctAnswer.replace('Option ', '') : '';
  
  // Safely parse the year value
  let examYear = 0;
  try {
    const yearValue = questionData['Year'] || '0';
    const parsedYear = parseInt(yearValue, 10);
    examYear = isNaN(parsedYear) ? 0 : parsedYear;
  } catch (e) {
    console.warn(`Invalid year value: ${questionData['Year']}, using default 0`);
    examYear = 0;
  }

  const result = await client.execute({
    sql: query,
    args: [
      0, // Auto-generated number (will be updated later with row order)
      questionData['Question'] || '',
      (questionData['Subject'] || '').toLowerCase(),
      examYear,
      'JEE',
      'mcq',
      answerKey,
      correctAnswer,
      questionData['Solution'] || '',
      questionData['Chapter'] || '',
      1
    ]
  });

  // Ensure the returned ID is a valid number
  if (!result.rows[0] || !('id' in result.rows[0])) {
    throw new Error('Failed to get valid question ID from insert operation');
  }
  
  const id = Number(result.rows[0].id);
  if (isNaN(id) || !isFinite(id)) {
    throw new Error(`Invalid question ID returned: ${result.rows[0].id}`);
  }

  return id;
}

async function insertOptions(questionId: number, questionData: any) {
  const options = ['A', 'B', 'C', 'D'].map(label => ({
    label,
    text: questionData[`Option ${label}`] || '',
    isCorrect: questionData['Correct Answer'] === `Option ${label}`
  })).filter(option => option.text);

  const query = `
    INSERT INTO options (question_id, label, text, is_correct)
    VALUES (?, ?, ?, ?)
  `;

  for (const option of options) {
    await client.execute({
      sql: query,
      args: [questionId, option.label, option.text, option.isCorrect]
    });
  }
}

async function importQuestions(filePath: string) {
  await createTables();

  // Import csv-parser dynamically for ES modules
  const csvParser = await import('csv-parser');
  
  const questions: any[] = [];
  
  return new Promise<void>((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser.default())
      .on('data', (row: any) => {
        questions.push(row);
      })
      .on('end', async () => {
        console.log(`Parsed ${questions.length} questions from the CSV file.`);
        try {
          // Update with sequential question numbers
          for (let i = 0; i < questions.length; i++) {
            try {
              const questionId = await insertQuestion(questions[i]);
              
              // Validate questionId before using it
              if (isNaN(questionId) || !isFinite(questionId)) {
                console.error(`Invalid question ID: ${questionId}, skipping options and number update`);
                continue;
              }
              
              await insertOptions(questionId, questions[i]);
              
              // Ensure question number is a valid finite number
              const questionNumber = i + 1;
              if (!isFinite(questionNumber) || isNaN(questionNumber)) {
                console.warn(`Invalid question number index: ${i}, skipping number update`);
                continue;
              }
              
              // Update the question number to match its position in the CSV
              await client.execute({
                sql: `UPDATE questions SET number = ? WHERE id = ?`,
                args: [questionNumber, questionId]
              });
            } catch (error) {
              console.error(`Error inserting question ${i+1}:`, error);
            }
          }
          console.log('Import complete.');
          resolve();
        } catch (error) {
          console.error('Import failed:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      });
  });
}

const filePath = '/home/raven/coding-mess/pyq-saas/scraping/PYQ-questions-Master.csv';
importQuestions(filePath).catch(console.error);
