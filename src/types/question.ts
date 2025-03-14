export interface Option {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  number?: number;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
} 