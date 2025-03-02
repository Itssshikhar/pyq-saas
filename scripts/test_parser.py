import os
import sys
import json
from pathlib import Path

# Add the scripts directory to the Python path
script_dir = Path(__file__).parent
sys.path.append(str(script_dir))

from excel_to_turso import parse_text_file

def test_parse_text_file():
    """Test the parsing of the example text file."""
    # Get the path to the example text file
    example_file = os.path.join(script_dir, 'example_xl.txt')
    
    if not os.path.exists(example_file):
        print(f"Error: Example file not found at {example_file}")
        return
    
    # Parse the file
    questions = parse_text_file(example_file)
    
    # Print the parsed questions
    print(f"Found {len(questions)} questions:")
    for i, question in enumerate(questions, 1):
        print(f"\nQuestion {i}:")
        print(f"Text: {question.get('Question', '')[:50]}...")
        print(f"Subject: {question.get('Subject', '')}")
        print(f"Year: {question.get('Year', '')}")
        print(f"Chapter: {question.get('Chapter', '')}")
        print(f"Correct Answer: {question.get('Correct Answer', '')}")
        print("Options:")
        for option in ['Option A', 'Option B', 'Option C', 'Option D']:
            if option in question:
                print(f"  {option}: {question[option][:30]}...")
    
    # Save the parsed questions to a JSON file for inspection
    output_file = os.path.join(script_dir, 'parsed_questions.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\nParsed questions saved to {output_file}")

def convert_txt_to_csv():
    """Convert the example text file to CSV format."""
    example_file = os.path.join(script_dir, 'example_xl.txt')
    csv_file = os.path.join(script_dir, 'example_xl.csv')
    
    if not os.path.exists(example_file):
        print(f"Error: Example file not found at {example_file}")
        return
    
    # Parse the text file
    questions = parse_text_file(example_file)
    
    if not questions:
        print("No questions found in the file.")
        return
    
    # Get all possible headers
    headers = set()
    for question in questions:
        headers.update(question.keys())
    
    # Convert to list and ensure 'Number' is first
    headers = list(headers)
    if 'Number' in headers:
        headers.remove('Number')
    headers = ['Number'] + sorted(headers)
    
    # Write to CSV
    import csv
    with open(csv_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(questions)
    
    print(f"Converted text file to CSV: {csv_file}")

if __name__ == '__main__':
    # Test the text file parser
    test_parse_text_file()
    
    # Convert to CSV for future use
    convert_txt_to_csv() 