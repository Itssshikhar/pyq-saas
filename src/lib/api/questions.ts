import { Question } from '../types/question';
import { auth } from '../firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GetQuestionsParams {
  subject?: string;
  page?: number;
  limit?: number;
}

export async function getQuestions({ subject, page = 1, limit = 10 }: GetQuestionsParams = {}) {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  // Get the current user's token
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/questions?${params.toString()}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  return response.json() as Promise<Question[]>;
}

export async function getQuestion(id: number) {
  // Get the current user's token
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch question: ${response.statusText}`);
  }

  return response.json() as Promise<Question>;
} 