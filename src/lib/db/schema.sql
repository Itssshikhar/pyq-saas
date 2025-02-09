-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    text TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'mathematics')),
    exam_year INTEGER NOT NULL,
    exam_name TEXT NOT NULL,
    chapter TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical')),
    answer_key TEXT NOT NULL,  -- Store MCQ option (1/2/3/4) or numerical value
    correct_answer TEXT,       -- For storing full text of correct answer
    explanation TEXT,
    page INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    page INTEGER NOT NULL,
    x0 REAL NOT NULL,
    y0 REAL NOT NULL,
    x1 REAL NOT NULL,
    y1 REAL NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Statements table
CREATE TABLE IF NOT EXISTS statements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    position INTEGER NOT NULL, -- To maintain order of statements
    is_correct BOOLEAN, -- For statement-based questions
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Bounding boxes table
CREATE TABLE IF NOT EXISTS bounding_boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    x0 REAL NOT NULL,
    y0 REAL NOT NULL,
    x1 REAL NOT NULL,
    y1 REAL NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN,
    attempt_count INTEGER DEFAULT 1,
    time_spent INTEGER, -- in seconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(user_id, question_id)
);

-- Mathematical expressions table (for preserving LaTeX or other math notation)
CREATE TABLE IF NOT EXISTS math_expressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    math_notation TEXT NOT NULL, -- LaTeX or other math notation
    position INTEGER NOT NULL, -- Position in the question text
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
); 