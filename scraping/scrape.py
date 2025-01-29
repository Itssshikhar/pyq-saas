import fitz  # PyMuPDF
from pdf2image import convert_from_path
import pytesseract
import re
import json
import os
import unicodedata
from typing import List, Dict, Any, Optional, Tuple

# Configure paths
# Path to your input PDF
PDF_PATH = "JEE Main 2024 (27 Jan Shift 1) Previous Year Paper with Answer Keys - MathonGo.pdf"
OUTPUT_DIR = "output"      # Directory to save extracted images and JSON

# Create output directory if not exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_math_text(text: str) -> str:
    """Clean and format mathematical expressions."""
    # Common mathematical symbols and their replacements
    math_replacements = {
        '×': '×',  # Keep multiplication sign
        '÷': '÷',  # Keep division sign
        '±': '±',  # Keep plus-minus sign
        '∓': '∓',  # Keep minus-plus sign
        '⋅': '·',  # Convert to middle dot
        '≠': '≠',  # Keep not equal sign
        '≥': '≥',  # Keep greater than or equal
        '≤': '≤',  # Keep less than or equal
        '≈': '≈',  # Keep approximately equal
        '∝': '∝',  # Keep proportional to
        '→': '→',  # Keep right arrow
        '←': '←',  # Keep left arrow
        '↑': '↑',  # Keep up arrow
        '↓': '↓',  # Keep down arrow
        '⇒': '⇒',  # Keep implies
        '⇔': '⇔',  # Keep if and only if
        '∞': '∞',  # Keep infinity
        '√': '√',  # Keep square root
        '∴': '∴',  # Keep therefore
        '∵': '∵',  # Keep because
        '∎': '∎',  # Keep end of proof
        'α': 'α',  # Keep alpha
        'β': 'β',  # Keep beta
        'γ': 'γ',  # Keep gamma
        'δ': 'δ',  # Keep delta
        'θ': 'θ',  # Keep theta
        'λ': 'λ',  # Keep lambda
        'μ': 'μ',  # Keep mu
        'π': 'π',  # Keep pi
        'σ': 'σ',  # Keep sigma
        'τ': 'τ',  # Keep tau
        'φ': 'φ',  # Keep phi
        'ω': 'ω',  # Keep omega
        '°': '°',  # Keep degree
        '′': "'",  # Convert prime
        '″': '"',  # Convert double prime
    }
    
    for old, new in math_replacements.items():
        text = text.replace(old, new)
    
    # Handle superscripts and subscripts
    text = re.sub(r'(\d+)\s*\^\s*(\d+)', r'\1^\2', text)  # Format exponents
    text = re.sub(r'_\s*(\d+)', r'_\1', text)  # Format subscripts
    
    # Handle fractions
    text = re.sub(r'(\d+)\s*/\s*(\d+)', r'\1/\2', text)
    
    # Handle scientific notation
    text = re.sub(r'(\d+)\s*[×xX]\s*10\s*\^\s*([+-]?\d+)', r'\1×10^\2', text)
    
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

def extract_options(text: str) -> Tuple[str, List[Dict[str, str]]]:
    """Extract options from question text."""
    # Split text into question and options
    option_pattern = r'(?:\n|\s)(?=\([1-4]\))'
    parts = re.split(option_pattern, text)
    
    if len(parts) <= 1:
        return text, []
    
    question_text = parts[0].strip()
    options = []
    
    # Process each option
    for part in parts[1:]:
        match = re.match(r'\((\d)\)(.*?)(?=\(\d\)|$)', part, re.DOTALL)
        if match:
            number = match.group(1)
            option_text = match.group(2).strip()
            options.append({
                "label": f"({number})",
                "text": clean_text(option_text)
            })
    
    return question_text, options

def extract_statements(text: str) -> Tuple[str, List[str]]:
    """Extract statements from question text."""
    statements = []
    statement_pattern = r'Statement\s*\((I+)\)\s*:(.*?)(?=Statement|$)'
    matches = re.finditer(statement_pattern, text, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        statement_num = match.group(1)
        statement_text = clean_text(match.group(2))
        statements.append(f"Statement ({statement_num}): {statement_text}")
    
    # Remove statements from original text
    cleaned_text = re.sub(statement_pattern, '', text, flags=re.DOTALL | re.IGNORECASE)
    return cleaned_text.strip(), statements

def associate_images_with_questions(questions: List[Dict], images: List[Dict]) -> None:
    """Associate images with questions based on page number and position."""
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

def parse_question(text: str, page_num: int, bbox: Dict) -> Optional[Dict]:
    """Parse a question text into structured format."""
    # Extract question number
    question_match = extract_question_number(text)
    if not question_match:
        return None
    
    question_num, remaining_text = question_match
    
    # Extract statements if present
    remaining_text, statements = extract_statements(remaining_text)
    
    # Extract options
    question_text, options = extract_options(remaining_text)
    
    # Clean the question text
    question_text = clean_text(question_text)
    
    # Structure the question
    question_data = {
        "number": question_num,
        "text": question_text,
        "options": options,
        "images": [],
        "page": page_num,
        "bbox": bbox
    }
    
    # Add statements if present
    if statements:
        question_data["statements"] = statements
    
    return question_data

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

def extract_data_from_pdf(pdf_path: str, output_dir: str) -> Dict[str, Any]:
    """Extract and structure all data from the PDF."""
    questions = []
    images = []
    
    with fitz.open(pdf_path) as pdf:
        # Extract questions and images from each page
        for page in pdf:
            # Extract questions
            page_questions = extract_questions_from_page(page)
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
                        "bbox": {
                            "x0": bbox.x0,
                            "y0": bbox.y0,
                            "x1": bbox.x1,
                            "y1": bbox.y1
                        }
                    })
    
    # Associate images with questions
    associate_images_with_questions(questions, images)
    
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
