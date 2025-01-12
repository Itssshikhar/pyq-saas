import fitz  # PyMuPDF
from pdf2image import convert_from_path
import pytesseract
import re
import json
import os

# Configure paths
# Path to your input PDF
PDF_PATH = "JEE Main 2024 (27 Jan Shift 1) Previous Year Paper with Answer Keys - MathonGo.pdf"
OUTPUT_DIR = "output"      # Directory to save extracted images and JSON

# Create output directory if not exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Function to extract text from a structured PDF


def extract_text_from_pdf(pdf_path):
    """Extract text from a structured PDF."""
    text_data = []
    with fitz.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf, start=1):
            text = page.get_text()
            if text.strip():
                text_data.append({"page": page_num, "text": text.strip()})
    return text_data

# Function to extract images from a PDF


def extract_images_from_pdf(pdf_path, output_dir):
    """Extract images embedded in a PDF."""
    image_paths = []
    with fitz.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf, start=1):
            for img_index, img in enumerate(page.get_images(full=True), start=1):
                xref = img[0]
                base_image = pdf.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_filename = f"page{page_num}_img{img_index}.{image_ext}"
                image_path = os.path.join(output_dir, image_filename)
                with open(image_path, "wb") as img_file:
                    img_file.write(image_bytes)
                image_paths.append({"page": page_num, "path": image_path})
    return image_paths

# Function to extract text from scanned PDFs using OCR


def extract_text_from_scanned_pdf(pdf_path):
    """Extract text from a scanned PDF using OCR."""
    pages = convert_from_path(pdf_path)
    text_data = []
    for page_num, page in enumerate(pages, start=1):
        text = pytesseract.image_to_string(page)
        text_data.append({"page": page_num, "text": text.strip()})
    return text_data

# Function to segment text into questions and options


def segment_text_into_questions(text_data):
    """Segment extracted text into questions, options, and answers."""
    questions = []
    question_pattern = re.compile(r"(Q\d+\.|\d+\.)")  # Matches "Q1." or "1."
    # Matches "a)", "b.", etc.
    option_pattern = re.compile(r"([a-dA-D]\)|[a-dA-D]\.)")

    for page in text_data:
        raw_text = page["text"]
        segments = re.split(question_pattern, raw_text)
        for i in range(1, len(segments), 2):
            question_text = segments[i] + segments[i + 1]
            options = option_pattern.split(question_text)
            options_cleaned = [opt.strip() for opt in options if opt.strip()]

            # Parse question and options
            if len(options_cleaned) > 1:
                question = {
                    "question": options_cleaned[0],
                    "options": options_cleaned[1:],
                }
                questions.append(question)
    return questions

# Main extraction pipeline


def extract_data_from_pdf(pdf_path, output_dir):
    """Extract data (text, images) from a PDF and structure it."""
    # Detect if PDF is text-based or image-based
    text_data = extract_text_from_pdf(pdf_path)
    if not text_data:  # If no text, assume it's a scanned PDF
        text_data = extract_text_from_scanned_pdf(pdf_path)

    # Extract images
    image_data = extract_images_from_pdf(pdf_path, output_dir)

    # Segment text into questions
    questions = segment_text_into_questions(text_data)

    # Structure the data
    extracted_data = {
        "text": text_data,
        "questions": questions,
        "images": image_data,
    }

    # Save the extracted data as JSON
    output_json_path = os.path.join(output_dir, "extracted_data.json")
    with open(output_json_path, "w") as json_file:
        json.dump(extracted_data, json_file, indent=4)

    print(f"Data extracted and saved to {output_json_path}")
    return extracted_data


# Run the pipeline
if __name__ == "__main__":
    extract_data_from_pdf(PDF_PATH, OUTPUT_DIR)
