from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv
from .database import get_db
from .models import Question, QuestionResponse, UserProgress
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
            SELECT q.id, q.number, q.text, q.subject, q.exam_year, q.exam_name, 
                   q.chapter, q.question_type, q.answer_key, q.correct_answer, q.explanation,
                   o.label as option_label, o.text as option_text, o.is_correct as option_is_correct
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
        """
        params = []
        
        if subject:
            query += " WHERE q.subject = ?"
            params.append(subject)
            
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        print(f"Executing query: {query}")
        print(f"With params: {params}")
        
        # Execute query with cursor, converting params to tuple
        cursor = db.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        print(f"Query returned {len(rows)} rows")
        
        # Process the results into a structured format
        questions = {}
        for row in rows:
            q_id = row[0]  # id
            if q_id not in questions:
                questions[q_id] = {
                    'id': q_id,
                    'number': row[1],  # number
                    'text': row[2],    # text
                    'subject': row[3], # subject
                    'options': [],
                    'images': [],      # Keep empty images array for compatibility
                    'statements': []   # Keep empty statements array for compatibility
                }
            
            option_label = row[11]  # option_label
            option_text = row[12]   # option_text
            option_is_correct = row[13]  # option_is_correct
            
            if option_label is not None and option_text is not None:
                # Check if this option already exists
                option_exists = False
                for opt in questions[q_id]['options']:
                    if opt['label'] == str(option_label):
                        option_exists = True
                        break
                
                if not option_exists:
                    questions[q_id]['options'].append({
                        'label': str(option_label),
                        'text': str(option_text),
                        'is_correct': bool(option_is_correct) if option_is_correct is not None else False
                    })
        
        # Ensure each question has at least an empty options array
        for q_id in questions:
            if not questions[q_id]['options']:
                questions[q_id]['options'] = []
        
        result = list(questions.values())
        print(f"Returning {len(result)} questions")
        return result
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in get_questions: {str(e)}")
        print(f"Error details: {error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")

@app.get("/api/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        query = """
            SELECT q.id, q.number, q.text, q.subject, q.exam_year, q.exam_name, 
                   q.chapter, q.question_type, q.answer_key, q.correct_answer, q.explanation,
                   o.label as option_label, o.text as option_text, o.is_correct as option_is_correct
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
            WHERE q.id = ?
        """
        
        print(f"Executing query for question_id: {question_id}")
        
        # Execute query with cursor, using a single-item tuple
        cursor = db.execute(query, (question_id,))
        rows = cursor.fetchall()
        
        if not rows:
            raise HTTPException(status_code=404, detail="Question not found")
            
        print(f"Query returned {len(rows)} rows")
            
        # Process the results into a structured format
        question = {
            'id': rows[0][0],      # id
            'number': rows[0][1],   # number
            'text': rows[0][2],     # text
            'subject': rows[0][3],  # subject
            'options': [],
            'images': [],          # Keep empty images array for compatibility
            'statements': []       # Keep empty statements array for compatibility
        }
        
        for row in rows:
            option_label = row[11]  # option_label
            option_text = row[12]   # option_text
            option_is_correct = row[13]  # option_is_correct
            
            if option_label is not None and option_text is not None:
                # Check if this option already exists
                option_exists = False
                for opt in question['options']:
                    if opt['label'] == str(option_label):
                        option_exists = True
                        break
                
                if not option_exists:
                    question['options'].append({
                        'label': str(option_label),
                        'text': str(option_text),
                        'is_correct': bool(option_is_correct) if option_is_correct is not None else False
                    })
        
        # Ensure question has at least an empty options array
        if not question['options']:
            question['options'] = []
            
        print(f"Returning question with ID: {question['id']}")
        return question
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in get_question: {str(e)}")
        print(f"Error details: {error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch question: {str(e)}")

@app.get("/api/questions/{question_id}/answer")
async def get_question_answer(
    question_id: int,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get the correct answer for a specific question.
    This endpoint should be called after the user has submitted their answer.
    """
    try:
        # First, check if the question exists
        question_query = "SELECT id FROM questions WHERE id = ?"
        question_cursor = db.execute(question_query, (question_id,))
        question_row = question_cursor.fetchone()
        
        if not question_row:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Get the correct answer
        answer_query = """
            SELECT o.label
            FROM options o
            WHERE o.question_id = ? AND o.is_correct = 1
        """
        
        answer_cursor = db.execute(answer_query, (question_id,))
        answer_row = answer_cursor.fetchone()
        
        if not answer_row:
            raise HTTPException(status_code=404, detail="Correct answer not found for this question")
        
        # Get the explanation if available
        explanation_query = """
            SELECT explanation
            FROM questions
            WHERE id = ?
        """
        
        explanation_cursor = db.execute(explanation_query, (question_id,))
        explanation_row = explanation_cursor.fetchone()
        
        explanation = explanation_row[0] if explanation_row and explanation_row[0] else "No explanation available."
        
        return {
            "correct_answer": answer_row[0],
            "explanation": explanation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user-progress")
async def track_user_progress(
    progress: UserProgress,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Track user progress for a specific question.
    This endpoint should be called after the user has submitted their answer.
    """
    try:
        # Check if there's an existing record for this user and question
        check_query = """
            SELECT id, attempt_count 
            FROM user_progress 
            WHERE user_id = ? AND question_id = ?
        """
        check_cursor = db.execute(check_query, (current_user, progress.question_id))
        existing_record = check_cursor.fetchone()
        
        if existing_record:
            # Update existing record
            update_query = """
                UPDATE user_progress
                SET answer = ?, is_correct = ?, attempt_count = ?, time_spent = ?
                WHERE id = ?
            """
            new_attempt_count = existing_record[1] + 1
            db.execute(
                update_query, 
                (
                    progress.answer, 
                    progress.is_correct, 
                    new_attempt_count,
                    progress.time_spent,
                    existing_record[0]
                )
            )
            return {"message": "Progress updated", "attempt_count": new_attempt_count}
        else:
            # Insert new record
            insert_query = """
                INSERT INTO user_progress (user_id, question_id, answer, is_correct, attempt_count, time_spent)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            db.execute(
                insert_query, 
                (
                    current_user, 
                    progress.question_id, 
                    progress.answer, 
                    progress.is_correct, 
                    progress.attempt_count,
                    progress.time_spent
                )
            )
            return {"message": "Progress recorded", "attempt_count": progress.attempt_count}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user-progress/stats")
async def get_user_progress_stats(
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get statistics about the user's progress.
    """
    try:
        # Get total questions attempted
        attempted_query = """
            SELECT COUNT(DISTINCT question_id) 
            FROM user_progress 
            WHERE user_id = ?
        """
        attempted_cursor = db.execute(attempted_query, (current_user,))
        attempted_row = attempted_cursor.fetchone()
        total_attempted = attempted_row[0] if attempted_row else 0
        
        # Get total questions answered correctly
        correct_query = """
            SELECT COUNT(DISTINCT question_id) 
            FROM user_progress 
            WHERE user_id = ? AND is_correct = 1
        """
        correct_cursor = db.execute(correct_query, (current_user,))
        correct_row = correct_cursor.fetchone()
        total_correct = correct_row[0] if correct_row else 0
        
        # Get total questions by subject
        by_subject_query = """
            SELECT q.subject, COUNT(DISTINCT up.question_id) as attempted, 
                   SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM user_progress up
            JOIN questions q ON up.question_id = q.id
            WHERE up.user_id = ?
            GROUP BY q.subject
        """
        by_subject_cursor = db.execute(by_subject_query, (current_user,))
        by_subject_rows = by_subject_cursor.fetchall()
        
        by_subject = []
        for row in by_subject_rows:
            by_subject.append({
                "subject": row[0],
                "attempted": row[1],
                "correct": row[2],
                "percentage": round((row[2] / row[1]) * 100) if row[1] > 0 else 0
            })
        
        return {
            "total_attempted": total_attempted,
            "total_correct": total_correct,
            "percentage": round((total_correct / total_attempted) * 100) if total_attempted > 0 else 0,
            "by_subject": by_subject
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 