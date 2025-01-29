import { executeQuery, withTransaction, type ResultSet } from './client.js';

interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Option {
  label: string;
  text: string;
}

interface Question {
  number: number;
  text: string;
  options: Option[];
  images: string[];
  page: number;
  bbox: BoundingBox;
  statements?: string[];
}

interface ExtractedData {
  questions: Question[];
  images: {
    page: number;
    path: string;
    bbox: BoundingBox;
  }[];
}

export async function importData(data: ExtractedData): Promise<void> {
  // Validate input data
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid data format: questions array is missing');
  }

  if (!data.images || !Array.isArray(data.images)) {
    throw new Error('Invalid data format: images array is missing');
  }

  try {
    await withTransaction(async () => {
      // Import questions
      for (const question of data.questions) {
        // Validate question data
        if (typeof question.number !== 'number' || !question.text || !question.page) {
          throw new Error(`Invalid question data: ${JSON.stringify(question)}`);
        }

        // Insert question
        const questionResult = await executeQuery(
          `INSERT INTO questions (number, text, page) 
           VALUES (?, ?, ?) 
           RETURNING id`,
          [question.number, question.text, question.page]
        );
        
        if (!questionResult.rows?.[0]?.id) {
          throw new Error('Failed to insert question: no ID returned');
        }

        const questionId = questionResult.rows[0].id as number;

        // Insert options
        for (const option of question.options) {
          await executeQuery(
            `INSERT INTO options (question_id, label, text) 
             VALUES (?, ?, ?)`,
            [questionId, option.label, option.text]
          );
        }

        // Insert statements if they exist
        if (question.statements) {
          for (let i = 0; i < question.statements.length; i++) {
            await executeQuery(
              `INSERT INTO statements (question_id, text, position) 
               VALUES (?, ?, ?)`,
              [questionId, question.statements[i], i]
            );
          }
        }

        // Insert question's bounding box
        if (!question.bbox) {
          throw new Error(`Missing bounding box for question ${question.number}`);
        }

        await executeQuery(
          `INSERT INTO bounding_boxes (question_id, x0, y0, x1, y1) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            questionId,
            question.bbox.x0,
            question.bbox.y0,
            question.bbox.x1,
            question.bbox.y1,
          ]
        );

        // Insert images
        for (const imagePath of question.images) {
          // Find matching image data from the images array
          const imageData = data.images.find((img) => img.path === imagePath);
          if (imageData) {
            await executeQuery(
              `INSERT INTO images (question_id, path, page, x0, y0, x1, y1) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                questionId,
                imagePath,
                imageData.page,
                imageData.bbox.x0,
                imageData.bbox.y0,
                imageData.bbox.x1,
                imageData.bbox.y1,
              ]
            );
          } else {
            console.warn(`Warning: Image data not found for path: ${imagePath}`);
          }
        }
      }
      console.log('Data import completed successfully');
    });
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 