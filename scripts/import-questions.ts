import { readFileSync } from 'fs';
import { join } from 'path';
import { importData } from '../src/lib/db/import-data.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // Read the JSON file
    const filePath = join(__dirname, '../scraping/output/extracted_data.json');
    
    if (!filePath) {
      throw new Error('Could not resolve file path');
    }

    let fileContent: string;
    try {
      fileContent = readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }

    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Import the data
    await importData(data);
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 