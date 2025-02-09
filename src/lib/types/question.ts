export interface Option {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Statement {
  text: string;
  position: number;
  isCorrect?: boolean;
}

export interface MathExpression {
  originalText: string;
  mathNotation: string;
  position: number;
}

export type QuestionType = 'mcq' | 'numerical';
export type Subject = 'physics' | 'chemistry' | 'mathematics';

export interface Question {
  id: number;
  number: number;
  text: string;
  subject: Subject;
  examYear: number;
  examName: string;
  questionType: QuestionType;
  correctAnswer?: string;
  explanation?: string;
  options: Option[];
  images: string[];
  statements: Statement[];
  mathExpressions: MathExpression[];
  page: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: number;
  userId: string;
  questionId: number;
  selectedAnswer?: string;
  isCorrect: boolean;
  attemptCount: number;
  timeSpent?: number;
  createdAt: string;
  updatedAt: string;
} 