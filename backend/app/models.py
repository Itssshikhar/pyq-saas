from pydantic import BaseModel
from typing import List, Optional

class Option(BaseModel):
    label: str
    text: str
    is_correct: Optional[bool] = False

class QuestionBase(BaseModel):
    number: int
    text: str
    options: List[Option]
    images: List[str]
    statements: Optional[List[str]] = []

class Question(QuestionBase):
    id: int

class QuestionResponse(Question):
    pass

class UserProgress(BaseModel):
    user_id: str
    question_id: int
    answer: Optional[str]
    is_correct: bool
    attempt_count: int = 1
    time_spent: Optional[int]  # in seconds 