import pandas as pd
import os
import libsql_experimental as libsql
from dotenv import load_dotenv
import sys
from datetime import datetime
import asyncio
import time
import random

# Load environment variables
load_dotenv()

# Get database URL and token from environment variables
DB_URL = os.getenv('TURSO_DATABASE_URL')
DB_TOKEN = os.getenv('TURSO_AUTH_TOKEN')

if not DB_URL or not DB_TOKEN:
    print("Error: Database URL or Auth Token not found in environment variables")
    sys.exit(1)

def connect_to_db():
    """Create a connection to the Turso database using libsql_experimental"""
    print(f"Connecting to {DB_URL}")
    try:
        client = libsql.connect(
            database=DB_URL,
            auth_token=DB_TOKEN
        )
        return client
    except Exception as e:
        print(f"Connection error: {str(e)}")
        print(f"URL being used: {DB_URL}")
        print(f"Please verify your auth token is correct and not expired")
        sys.exit(1)

def create_tables(client):
    """Create the necessary tables in the database if they don't exist"""
    try:
        client.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number INTEGER,
            text TEXT,
            subject TEXT,
            exam_year INTEGER,
            exam_name TEXT,
            chapter TEXT,
            question_type TEXT,
            answer_key TEXT,
            correct_answer TEXT,
            explanation TEXT,
            page INTEGER
        )
        ''')
        client.execute('''
        CREATE TABLE IF NOT EXISTS options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            label TEXT,
            text TEXT,
            is_correct BOOLEAN,
            FOREIGN KEY(question_id) REFERENCES questions(id)
        )
        ''')
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        sys.exit(1)

def insert_question(client, row, number):
    """Insert a question and its options into the database"""
    # Extract the letter from "Option X" format
    correct_answer = row['Correct Answer']
    if not correct_answer.startswith('Option '):
        raise ValueError(f"Invalid correct answer format. Must start with 'Option '. Got: {correct_answer}")
    
    answer_letter = correct_answer.split(' ')[1]
    if answer_letter not in ['A', 'B', 'C', 'D']:
        raise ValueError(f"Invalid correct answer letter. Must be A, B, C, or D. Got: {answer_letter}")
    
    # Convert and sanitize data
    def sanitize_text(text):
        if pd.isna(text):
            return ""
        return str(text).strip()

    def sanitize_int(value):
        if pd.isna(value):
            return 0
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0
    
    # Prepare question data with proper type conversion
    question_data = {
        'number': sanitize_int(number),
        'text': sanitize_text(row['Question']),
        'subject': sanitize_text(row['Subject']).lower(),
        'exam_year': sanitize_int(row['Year']),
        'exam_name': 'JEE',
        'chapter': sanitize_text(row['Chapter']),
        'question_type': 'mcq',
        'answer_key': answer_letter,
        'correct_answer': sanitize_text(row[f'Option {answer_letter}']),
        'explanation': sanitize_text(row['Solution']),
        'page': 1
    }
    
    # Insert question
    query = """
    INSERT INTO questions (
        number, text, subject, exam_year, exam_name, chapter,
        question_type, answer_key, correct_answer, explanation, page
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) RETURNING id
    """
    
    max_retries = 10
    base_delay = 1  # Base delay in seconds
    
    for attempt in range(max_retries):
        try:
            # Execute the question insert with sanitized data
            params = (
                question_data['number'],
                question_data['text'],
                question_data['subject'],
                question_data['exam_year'],
                question_data['exam_name'],
                question_data['chapter'],
                question_data['question_type'],
                question_data['answer_key'],
                question_data['correct_answer'],
                question_data['explanation'],
                question_data['page']
            )
            
            result = client.execute(query, params)
            question_id = result.fetchone()[0]

            # Insert options with sanitized data
            options = [
                ('A', sanitize_text(row['Option A']), 1 if answer_letter == 'A' else 0),
                ('B', sanitize_text(row['Option B']), 1 if answer_letter == 'B' else 0),
                ('C', sanitize_text(row['Option C']), 1 if answer_letter == 'C' else 0),
                ('D', sanitize_text(row['Option D']), 1 if answer_letter == 'D' else 0)
            ]
            
            for label, text, is_correct in options:
                options_query = """
                INSERT INTO options (question_id, label, text, is_correct)
                VALUES (?, ?, ?, ?)
                """
                client.execute(options_query, (question_id, label, text, is_correct))
            
            return  # Success! Exit the function
                
        except Exception as e:
            if 'database is locked' in str(e) and attempt < max_retries - 1:
                # Calculate exponential backoff with jitter
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 0.1), 30)
                print(f"Database locked, attempt {attempt + 1}/{max_retries}. Waiting {delay:.2f} seconds...")
                time.sleep(delay)
                continue
            raise  # Re-raise the exception if we've exhausted retries or it's a different error

def clear_existing_data(client):
    """Clear all existing data from the tables"""
    try:
        # Delete in correct order due to foreign key constraints
        client.execute("DELETE FROM options")
        client.execute("DELETE FROM questions")
        print("Cleared existing data from the database")
    except Exception as e:
        print(f"Error clearing existing data: {str(e)}")
        sys.exit(1)

def check_question_exists(client, number):
    """Check if a question with the given number already exists"""
    try:
        result = client.execute("SELECT id FROM questions WHERE number = ?", (number,))
        return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking question existence: {str(e)}")
        return False

def process_excel(excel_file, should_clear_existing=True):
    client = None
    try:
        # Read Excel file
        df = pd.read_excel(excel_file)
        print(f"Successfully read Excel file with {len(df)} rows")
        
        required_columns = [
            'Question', 'Option A', 'Option B', 'Option C', 'Option D',
            'Correct Answer', 'Subject', 'Year', 'Chapter', 'Solution'
        ]
        
        # Verify all required columns exist
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            print(f"Error: Missing required columns: {missing_columns}")
            sys.exit(1)
            
        # Connect to database
        client = connect_to_db()
        
        # Verify connection with a simple query
        try:
            client.execute("SELECT 1")
            print("Database connection test successful!")
        except Exception as e:
            print(f"Database connection test failed: {str(e)}")
            raise
        
        # Create tables if they don't exist
        create_tables(client)
        
        # Clear existing data if requested
        if should_clear_existing:
            clear_existing_data(client)
        
        # Process each row with error handling and progress tracking
        total_rows = len(df)
        successful_inserts = 0
        failed_inserts = 0
        skipped_inserts = 0
        
        for index, row in df.iterrows():
            try:
                question_number = index + 1
                
                # Skip if question already exists and we're not clearing data
                if not should_clear_existing and check_question_exists(client, question_number):
                    skipped_inserts += 1
                    if skipped_inserts % 10 == 0:
                        print(f"Skipped {skipped_inserts} existing questions")
                    continue
                
                insert_question(client, row, question_number)
                successful_inserts += 1
                if successful_inserts % 10 == 0:  # Print progress every 10 successful inserts
                    print(f"Progress: {successful_inserts}/{total_rows} questions inserted successfully")
            except Exception as e:
                failed_inserts += 1
                print(f"Error inserting question {index + 1}: {str(e)}")
                print("Continuing with next question...")
                continue
                
        print(f"\nImport completed!")
        print(f"Successfully inserted: {successful_inserts} questions")
        print(f"Failed to insert: {failed_inserts} questions")
        print(f"Skipped existing: {skipped_inserts} questions")
        
        if failed_inserts > 0:
            print("Some insertions failed. Please check the logs above for details.")
            sys.exit(1)
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        sys.exit(1)
    finally:
        if client:
            print("Database connection closed")

def main():
    if len(sys.argv) < 2:
        print("Usage: python import_excel_to_db.py <excel_file_path> [--keep-existing]")
        sys.exit(1)
        
    excel_file = sys.argv[1]
    if not os.path.exists(excel_file):
        print(f"Error: File {excel_file} not found")
        sys.exit(1)
    
    # Check if we should keep existing data
    should_clear_existing = "--keep-existing" not in sys.argv
    
    process_excel(excel_file, should_clear_existing)

if __name__ == "__main__":
    main() 