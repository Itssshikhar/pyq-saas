'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Question } from '@/types/question'

// API base URL - use environment variable or default to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function QuestionView({ subject }: { subject: string }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>()
  const [showExplanation, setShowExplanation] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Get the auth token from localStorage (assuming it's stored there after login)
        const token = localStorage.getItem('authToken');
        
        // Fetch questions from the FastAPI backend
        const response = await fetch(`${API_BASE_URL}/api/questions?subject=${subject}&page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch questions: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received data from API:', data);
        
        // Transform the data to match the Question interface if needed
        const transformedData = data.map((q: any) => ({
          id: q.id,
          text: q.text,
          options: Array.isArray(q.options) 
            ? q.options.map((opt: any) => ({
                label: opt.label,
                text: opt.text,
                isCorrect: opt.is_correct
              }))
            : [],
          correctAnswer: q.options?.find((o: any) => o.is_correct)?.label || "0", // Find correct answer
          explanation: q.explanation || "Explanation will be available soon.", // Use explanation from API if available
        }));
        
        console.log('Transformed data:', transformedData);
        setQuestions(transformedData);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject]);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error || questions.length === 0) {
    return <div>Error: {error || 'No questions available'}</div>;
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const hasAnswered = answeredQuestions.has(currentQuestion.id)

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(undefined)
      setShowExplanation(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(undefined)
      setShowExplanation(false)
    }
  }

  const handleCheckAnswer = async () => {
    if (!selectedAnswer) return;
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Fetch the correct answer from the FastAPI backend
      const response = await fetch(`${API_BASE_URL}/api/questions/${currentQuestion.id}/answer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch answer');
      }
      
      const data = await response.json();
      const correctAnswer = data.correct_answer.toString();
      
      // Update the current question with the correct answer and explanation
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        correctAnswer: correctAnswer,
        explanation: data.explanation,
      };
      
      setQuestions(updatedQuestions);
      setShowExplanation(true);
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      
      // Track user progress
      const isCorrect = parseInt(selectedAnswer) === parseInt(correctAnswer);
      
      await fetch(`${API_BASE_URL}/api/user-progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'current-user', // This will be replaced by the actual user ID in the backend
          question_id: currentQuestion.id,
          answer: selectedAnswer,
          is_correct: isCorrect,
          attempt_count: 1,
          time_spent: 0, // You can implement a timer to track time spent
        }),
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer.toString()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Question {currentQuestion.number || currentQuestionIndex + 1}</h3>
          <p className="text-gray-800 dark:text-gray-200">{currentQuestion.text}</p>
        </div>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={showExplanation}
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 p-3 rounded-md ${
                showExplanation
                  ? option.isCorrect
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : selectedAnswer === option.label
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : ''
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <RadioGroupItem
                value={option.label}
                id={`option-${index}`}
                className="mt-1"
              />
              <Label
                htmlFor={`option-${index}`}
                className="flex-grow text-gray-900 dark:text-white"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-900 dark:text-blue-100">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {!showExplanation && (
          <Button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className="px-8"
          >
            Check Answer
          </Button>
        )}

        <Button
          onClick={handleNextQuestion}
          disabled={isLastQuestion || !hasAnswered}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

