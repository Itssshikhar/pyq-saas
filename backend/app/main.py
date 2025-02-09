from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv
from .database import get_db
from .models import Question, QuestionResponse
from .auth import get_current_user

# Load environment variables
load_dotenv()

app = FastAPI(title="PyQ API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pyq-saas.vercel.app", "http://localhost:3000"],  # Add local development URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PyQ API is running"}

@app.get("/api/questions", response_model=List[QuestionResponse])
async def get_questions(
    subject: Optional[str] = Query(None, description="Filter questions by subject"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of questions per page"),
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    offset = (page - 1) * limit
    
    try:
        # Build the query based on whether subject filter is provided
        query = """
            SELECT q.*, o.label as option_label, o.text as option_text, 
                   i.path as image_path, s.text as statement_text
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
            LEFT JOIN images i ON q.id = i.question_id
            LEFT JOIN statements s ON q.id = s.question_id
        """
        params = []
        
        if subject:
            query += " WHERE q.subject = ?"
            params.append(subject)
            
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        # Execute query with cursor, converting params to tuple
        cursor = db.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        # Process the results into a structured format
        questions = {}
        for row in rows:
            q_id = row[0]  # Using index instead of dict access
            if q_id not in questions:
                questions[q_id] = {
                    'id': q_id,
                    'number': row[1],  # Assuming 'number' is the second column
                    'text': row[2],    # Assuming 'text' is the third column
                    'options': [],
                    'images': [],
                    'statements': []
                }
            
            option_label = row[3]  # Assuming option_label is the fourth column
            option_text = row[4]   # Assuming option_text is the fifth column
            if option_label is not None and option_text is not None:
                questions[q_id]['options'].append({
                    'label': str(option_label),  # Convert to string
                    'text': str(option_text)     # Convert to string for consistency
                })
            
            image_path = row[5]  # Assuming image_path is the sixth column
            if image_path and image_path not in questions[q_id]['images']:
                questions[q_id]['images'].append(str(image_path))  # Convert to string
                
            statement_text = row[6]  # Assuming statement_text is the seventh column
            if statement_text and statement_text not in questions[q_id]['statements']:
                questions[q_id]['statements'].append(str(statement_text))  # Convert to string
        
        return list(questions.values())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        query = """
            SELECT q.*, o.label as option_label, o.text as option_text,
                   i.path as image_path, s.text as statement_text
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
            LEFT JOIN images i ON q.id = i.question_id
            LEFT JOIN statements s ON q.id = s.question_id
            WHERE q.id = ?
        """
        
        # Execute query with cursor, using a single-item tuple
        cursor = db.execute(query, (question_id,))
        rows = cursor.fetchall()
        
        if not rows:
            raise HTTPException(status_code=404, detail="Question not found")
            
        # Process the results into a structured format
        question = {
            'id': rows[0][0],      # id
            'number': rows[0][1],   # number
            'text': rows[0][2],     # text
            'options': [],
            'images': [],
            'statements': []
        }
        
        for row in rows:
            option_label = row[3]  # option_label
            option_text = row[4]   # option_text
            if option_label is not None and option_text is not None:
                question['options'].append({
                    'label': str(option_label),  # Convert to string
                    'text': str(option_text)     # Convert to string for consistency
                })
            
            image_path = row[5]  # image_path
            if image_path and image_path not in question['images']:
                question['images'].append(str(image_path))  # Convert to string
                
            statement_text = row[6]  # statement_text
            if statement_text and statement_text not in question['statements']:
                question['statements'].append(str(statement_text))  # Convert to string
        
        return question
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 