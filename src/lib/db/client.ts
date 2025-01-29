import { Client, type ResultSet, createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error('TURSO_DATABASE_URL is not defined');
if (!authToken) throw new Error('TURSO_AUTH_TOKEN is not defined');

const db: Client = createClient({
  url,
  authToken,
});

// Helper function to execute queries with error handling
async function executeQuery(query: string, params?: any[]): Promise<ResultSet> {
  try {
    if (!params) {
      return await db.execute(query);
    }
    return await db.execute({
      sql: query,
      args: params
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Function to execute queries within a transaction
async function withTransaction<T>(callback: () => Promise<T>): Promise<T> {
  const tx = await db.transaction('write');
  try {
    const result = await callback();
    await tx.commit();
    return result;
  } catch (error) {
    try {
      await tx.rollback();
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    throw error;
  }
}

export { executeQuery, withTransaction, type ResultSet }; 