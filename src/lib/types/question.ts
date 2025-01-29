export interface Option {
  label: string;
  text: string;
}

export interface Question {
  id: number;
  number: number;
  text: string;
  options: Option[];
  images: string[];
  statements: string[];
} 