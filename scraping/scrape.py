import fitz  # PyMuPDF
from pdf2image import convert_from_path
import pytesseract
import re
import json
import os
import unicodedata
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

# Configure paths
# Path to your input PDF
PDF_PATH = "JEE Main 2024 (27 Jan Shift 1) Previous Year Paper with Answer Keys - MathonGo.pdf"
OUTPUT_DIR = "output"      # Directory to save extracted images and JSON

# Create output directory if not exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Constants for question classification
SUBJECTS = {
    'physics': ['momentum', 'force', 'energy', 'gravity', 'velocity', 'acceleration', 'wave', 'current', 'voltage', 'resistance', 'magnetic', 'electric', 'quantum', 'nuclear'],
    'chemistry': ['acid', 'base', 'salt', 'reaction', 'compound', 'molecule', 'atom', 'bond', 'electron', 'oxidation', 'reduction', 'organic', 'inorganic', 'solution'],
    'mathematics': ['matrix', 'vector', 'function', 'equation', 'integral', 'derivative', 'probability', 'statistics', 'geometry', 'algebra', 'trigonometry', 'progression']
}

def clean_math_text(text: str) -> str:
    """Clean and format mathematical expressions."""
    # Common mathematical symbols and their replacements
    math_replacements = {
        '×': '\\times',  # Convert to LaTeX
        '÷': '\\div',
        '±': '\\pm',
        '∓': '\\mp',
        '⋅': '\\cdot',
        '≠': '\\neq',
        '≥': '\\geq',
        '≤': '\\leq',
        '≈': '\\approx',
        '∝': '\\propto',
        '→': '\\rightarrow',
        '←': '\\leftarrow',
        '↑': '\\uparrow',
        '↓': '\\downarrow',
        '⇒': '\\implies',
        '⇔': '\\iff',
        '∞': '\\infty',
        '√': '\\sqrt',
        '∴': '\\therefore',
        '∵': '\\because',
        '∎': '\\blacksquare',
        'α': '\\alpha',
        'β': '\\beta',
        'γ': '\\gamma',
        'δ': '\\delta',
        'θ': '\\theta',
        'λ': '\\lambda',
        'μ': '\\mu',
        'π': '\\pi',
        'σ': '\\sigma',
        'τ': '\\tau',
        'φ': '\\phi',
        'ω': '\\omega',
        '°': '^{\\circ}',
        '′': '\'',
        '″': '\"',
    }
    
    for old, new in math_replacements.items():
        text = text.replace(old, new)
    
    # Handle superscripts and subscripts
    text = re.sub(r'(\d+)\s*\^\s*(\d+)', r'$\1^{\2}$', text)  # Format exponents
    text = re.sub(r'_\s*(\d+)', r'$_{\1}$', text)  # Format subscripts
    
    # Handle fractions
    text = re.sub(r'(\d+)\s*/\s*(\d+)', r'$\\frac{\1}{\2}$', text)
    
    # Handle scientific notation
    text = re.sub(r'(\d+)\s*[×xX]\s*10\s*\^\s*([+-]?\d+)', r'$\1\\times10^{\2}$', text)
    
    return text

def clean_text(text: str) -> str:
    """Clean and normalize text while preserving mathematical expressions."""
    # Replace non-breaking spaces and other whitespace variants
    text = re.sub(r'[\xa0\u200b\u2028\u2029\ufeff]', ' ', text)
    
    # Normalize unicode characters
    text = unicodedata.normalize('NFKC', text)
    
    # Clean mathematical expressions
    text = clean_math_text(text)
    
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove any remaining control characters
    text = ''.join(char for char in text if unicodedata.category(char)[0] != 'C')
    
    return text.strip()

def extract_question_number(text: str) -> Optional[Tuple[int, str]]:
    """Extract question number and remaining text."""
    # Match different question number formats
    patterns = [
        r'Q\.?\s*(\d+)\.?\s*(.+)',  # Q1. or Q.1. format
        r'Question\s*(\d+)\.?\s*(.+)',  # Question 1 format
        r'^(\d+)\.?\s*(.+)'  # 1. format
    ]
    
    for pattern in patterns:
        match = re.match(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1)), match.group(2)
    return None

def extract_options(text: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Extract all options from question text."""
    # Split text into question and options
    # Look for options in the format (1) ... (2) ... (3) ... (4)
    options = []
    
    # First try to find the options section
    options_section_pattern = r'(?:In light of the above statements,|In the light of the above statements,|choose the correct answer from the options given below\s*:)(.+)$'
    options_section = re.search(options_section_pattern, text, re.DOTALL | re.IGNORECASE)
    
    if options_section:
        options_text = options_section.group(1)
    else:
        # If no options section found, look for options in the entire text
        options_text = text
    
    # Now extract individual options
    option_pattern = r'\((\d+)\)\s*([^(]+?)(?=\s*\(\d+\)|$)'
    matches = list(re.finditer(option_pattern, options_text, re.DOTALL))
    
    for match in matches:
        number = match.group(1)
        option_text = match.group(2).strip()
        # Clean up the option text
        option_text = re.sub(r'\s+', ' ', option_text)
        option_text = clean_text(option_text)
        
        if option_text and not option_text.lower().startswith(('in light of', 'in the light of')):
            options.append({
                "label": f"({number})",
                "text": option_text
            })
    
    # Return text before options section
    question_text = text
    if options_section:
        question_text = text[:options_section.start()].strip()
    return question_text, options

def extract_question_text(text: str) -> str:
    """Extract complete question text until the colon that marks its end."""
    # Find the last colon that's not part of a statement
    parts = text.split('\n')
    complete_text = []
    
    for part in parts:
        complete_text.append(part)
        # Stop if we find a colon that's not part of "Statement (X):"
        if ':' in part and not 'statement' in part.lower():
            break
    
    return ' '.join(complete_text).strip()

def extract_statements(text: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Extract statements from question text with position and correctness."""
    statements = []
    
    # First check if this is a statement-based question
    if not re.search(r'given below are two statements|statements?[\s\(]+[I|V]', text, re.IGNORECASE):
        return text, []
    
    # Extract the initial question text (before statements begin)
    intro_pattern = r'^(.*?)(?=Statement\s*\([I|V]+\)\s*:)'
    intro_match = re.search(intro_pattern, text, re.DOTALL | re.IGNORECASE)
    question_text = intro_match.group(1).strip() if intro_match else ""
    
    # Extract individual statements
    # First try to find Statement I and Statement II separately
    statement_texts = []
    
    # Look for Statement I
    statement1_pattern = r'Statement\s*\(I\)\s*:\s*([^.]+(?:\.[^.]+)*?)(?=\s*Statement|\s*In light of|\s*\([1-4]\)|$)'
    statement1_match = re.search(statement1_pattern, text, re.DOTALL | re.IGNORECASE)
    if statement1_match:
        statement_texts.append(statement1_match.group(1))
    
    # Look for Statement II
    statement2_pattern = r'Statement\s*\(II\)\s*:\s*([^.]+(?:\.[^.]+)*?)(?=\s*In light of|\s*\([1-4]\)|$)'
    statement2_match = re.search(statement2_pattern, text, re.DOTALL | re.IGNORECASE)
    if statement2_match:
        statement_texts.append(statement2_match.group(1))
    
    # Process each statement
    for i, statement_text in enumerate(statement_texts):
        # Clean up the statement text
        statement_text = re.sub(r'\s+', ' ', statement_text)
        statement_text = clean_text(statement_text)
        
        # Remove any "Statement (X):" that might have been captured
        statement_text = re.sub(r'^Statement\s*\([I|V]+\)\s*:', '', statement_text).strip()
        
        # Split by period and take the first meaningful part
        parts = [p.strip() for p in statement_text.split('.') if p.strip()]
        if parts:
            main_statement = parts[0]
            if main_statement and not main_statement.lower().startswith(('in light of', 'in the light of')):
                statements.append({
                    "text": main_statement,
                    "position": i
                })
    
    return question_text, statements

def extract_answer_and_explanation(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Extract answer and explanation from text if present."""
    # Look for answer pattern
    answer_match = re.search(r'Answer[:\s]+([^\n]+)', text, re.IGNORECASE)
    explanation_match = re.search(r'Explanation[:\s]+(.*?)(?=\n\n|$)', text, re.DOTALL | re.IGNORECASE)
    
    answer = answer_match.group(1).strip() if answer_match else None
    explanation = explanation_match.group(1).strip() if explanation_match else None
    
    return answer, explanation

"""
def associate_images_with_questions(questions: List[Dict], images: List[Dict]) -> None:
    ""Associate images with questions based on page number and position.""
    for image in images:
        page = image["page"]
        bbox = image["bbox"]
        
        # Find questions on the same page
        page_questions = [q for q in questions if q.get("page") == page]
        
        if page_questions:
            # Find closest question based on vertical position
            closest_question = min(page_questions, 
                                 key=lambda q: abs(q.get("bbox", {}).get("y0", 0) - bbox["y0"]))
            
            # Only associate if image is within reasonable distance
            if abs(closest_question["bbox"]["y0"] - bbox["y0"]) < 200:  # Adjust threshold as needed
                if "images" not in closest_question:
                    closest_question["images"] = []
                closest_question["images"].append(image["path"])
"""

def extract_math_expressions(text: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Extract mathematical expressions from text and replace with placeholders."""
    math_expressions = []
    position = 0
    
    # Find all mathematical expressions (text between $ signs and other patterns)
    math_pattern = r'\$[^$]+\$|\\[a-zA-Z]+{[^}]+}|\d+\s*[×÷±∓⋅≠≥≤≈∝→←↑↓⇒⇔∞√∴∵]\s*\d+'
    
    for match in re.finditer(math_pattern, text):
        original_text = match.group(0)
        math_notation = clean_math_text(original_text)
        
        math_expressions.append({
            "originalText": original_text,
            "mathNotation": math_notation,
            "position": position
        })
        position += 1
    
    return text, math_expressions

def determine_subject(text: str) -> str:
    """Determine the subject based on keywords in the question text."""
    text = text.lower()
    scores = {subject: 0 for subject in SUBJECTS.keys()}
    
    for subject, keywords in SUBJECTS.items():
        for keyword in keywords:
            if keyword in text:
                scores[subject] += 1
    
    # Return the subject with highest score, default to physics if no clear match
    max_score = max(scores.values())
    if max_score == 0:
        return 'physics'
    
    return max(scores.items(), key=lambda x: x[1])[0]

def determine_question_type(text: str, options: List[Dict]) -> str:
    """Determine if the question is MCQ or numerical."""
    # If it has options, it's MCQ
    if options and len(options) > 0:
        return 'mcq'
    # If it asks for a numerical value or contains calculations
    elif re.search(r'calculate|find|value|=|\d+', text, re.IGNORECASE):
        return 'numerical'
    # Default to MCQ
    return 'mcq'

def extract_exam_info(pdf_path: str) -> Tuple[int, str]:
    """Extract exam year and name from PDF filename or content."""
    # Extract from filename pattern: JEE Main YYYY
    match = re.search(r'JEE Main (\d{4})', pdf_path)
    if match:
        year = int(match.group(1))
        name = "JEE Main"
        return year, name
    
    # Default values if not found
    return datetime.now().year, "JEE Main"

def parse_question(text: str, page_num: int, bbox: Dict) -> Optional[Dict]:
    """Parse a question text into structured format."""
    # Extract question number
    question_match = extract_question_number(text)
    if not question_match:
        return None
    
    question_num, remaining_text = question_match
    
    # Extract statements if present and get clean question text
    question_text, statements = extract_statements(remaining_text)
    
    # If no statements found, try to extract complete question text
    if not statements:
        question_text = extract_question_text(remaining_text)
    
    # Extract options
    _, options = extract_options(remaining_text)
    
    # Clean the question text
    question_text = clean_text(question_text)
    
    # Extract math expressions
    question_text, math_expressions = extract_math_expressions(question_text)
    
    # Determine subject and question type
    subject = determine_subject(question_text)
    question_type = determine_question_type(question_text, options)
    
    # Get exam information
    exam_year, exam_name = extract_exam_info(PDF_PATH)
    
    # Extract explanation if present
    _, explanation = extract_answer_and_explanation(remaining_text)
    
    # Structure the question (only include fields that match our database schema)
    question_data = {
        "number": question_num,
        "text": question_text,
        "subject": subject,
        "exam_year": exam_year,
        "exam_name": exam_name,
        "question_type": question_type,
        "answer_key": extract_answer_key(remaining_text),
        "explanation": explanation,
        "page": page_num,
        # These will be stored in separate tables
        "options": options,
        "statements": statements,
        "math_expressions": math_expressions,
        # Internal use only, not for database
        "_bbox": bbox  # Prefix with _ to indicate internal use
    }
    
    return question_data

def extract_answer_key(text: str) -> Optional[str]:
    """Extract answer key from the text."""
    # Look for answer key pattern
    answer_match = re.search(r'answer_key\':\s*\'(\d+)\'', text)
    if answer_match:
        return answer_match.group(1)
    return None

def extract_questions_from_page(page: fitz.Page) -> List[Dict]:
    """Extract questions from a single page."""
    questions = []
    blocks = page.get_text("blocks")
    current_question = None
    current_text = []
    
    for block in blocks:
        text = block[4].strip()
        bbox = {
            "x0": block[0],
            "y0": block[1],
            "x1": block[2],
            "y1": block[3]
        }
        
        # Check if block starts a new question
        if re.match(r'Q\.?\s*\d+\.?|Question\s*\d+\.?|\d+\.', text, re.IGNORECASE):
            # Save previous question if exists
            if current_question and current_text:
                full_text = ' '.join(current_text)
                question = parse_question(full_text, page.number + 1, current_question["bbox"])
                if question:
                    questions.append(question)
            
            # Start new question
            current_question = {"text": text, "bbox": bbox}
            current_text = [text]
        elif current_question:
            # Continue current question
            current_text.append(text)
            # Update bbox to include this block
            current_question["bbox"].update({
                "x0": min(current_question["bbox"]["x0"], bbox["x0"]),
                "y0": min(current_question["bbox"]["y0"], bbox["y0"]),
                "x1": max(current_question["bbox"]["x1"], bbox["x1"]),
                "y1": max(current_question["bbox"]["y1"], bbox["y1"])
            })
    
    # Save last question
    if current_question and current_text:
        full_text = ' '.join(current_text)
        question = parse_question(full_text, page.number + 1, current_question["bbox"])
        if question:
            questions.append(question)
    
    return questions

def extract_answer_keys(pdf: fitz.Document) -> Dict[int, str]:
    """Extract answer keys from the end of the PDF."""
    answer_keys = {}
    
    # Start from the last page and work backwards
    for page_num in range(pdf.page_count - 1, -1, -1):
        page = pdf[page_num]
        text = page.get_text()
        
        # Look for answer key section
        if re.search(r'Answer\s*Keys?', text, re.IGNORECASE):
            # Extract all answer patterns
            # Match patterns like "1. (2)" or "1.(2)" or "1) (2)" or just "1) 2"
            answers = re.finditer(
                r'(\d+)[\.\)]\s*[\(\[]?(\d+|[\d\.]+)[\)\]]?',
                text
            )
            
            for match in answers:
                question_num = int(match.group(1))
                answer = match.group(2)
                # Clean up the answer (remove parentheses if present)
                answer = re.sub(r'[\(\)\[\]]', '', answer)
                answer_keys[question_num] = answer
            
            # Once we find the answer key section, we can stop
            break
    
    return answer_keys

def extract_data_from_pdf(pdf_path: str, output_dir: str) -> Dict[str, Any]:
    """Extract and structure all data from the PDF."""
    questions = []
    images = []
    
    with fitz.open(pdf_path) as pdf:
        # First extract answer keys
        answer_keys = extract_answer_keys(pdf)
        
        # Extract questions and images from each page
        for page in pdf:
            # Extract questions
            page_questions = extract_questions_from_page(page)
            
            # Associate answer keys with questions
            for question in page_questions:
                question_num = question["number"]
                if question_num in answer_keys:
                    question["answer_key"] = answer_keys[question_num]
                    
            
            questions.extend(page_questions)
            
            # Extract images
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Save image
                image_filename = f"page{page.number + 1}_img{img_index + 1}.{image_ext}"
                image_path = os.path.join(output_dir, image_filename)
                
                with open(image_path, "wb") as img_file:
                    img_file.write(image_bytes)
                
                # Get image location
                image_list = page.get_images()
                rect = page.get_image_rects(image_list[img_index])
                if rect:
                    bbox = rect[0]
                    images.append({
                        "page": page.number + 1,
                        "path": image_path,
                        "_bbox": {  # Prefix with _ to indicate internal use
                            "x0": bbox.x0,
                            "y0": bbox.y0,
                            "x1": bbox.x1,
                            "y1": bbox.y1
                        }
                    })
    
    
    # Remove internal fields before saving
    for question in questions:
        if '_bbox' in question:
            del question['_bbox']
    
    for image in images:
        if '_bbox' in image:
            del image['_bbox']
    
    # Structure the data
    extracted_data = {
        "questions": questions,
        "images": images
    }
    
    # Save as JSON
    output_json_path = os.path.join(output_dir, "extracted_data.json")
    with open(output_json_path, "w", encoding='utf-8') as json_file:
        json.dump(extracted_data, json_file, indent=2, ensure_ascii=False)
    
    return extracted_data

# Run the pipeline
if __name__ == "__main__":
    extract_data_from_pdf(PDF_PATH, OUTPUT_DIR)
