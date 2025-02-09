'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Question } from '@/types/question'

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
        const response = await fetch(`/api/questions?subject=${subject}`);
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
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

  const handleCheckAnswer = () => {
    setShowExplanation(true)
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id))
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
        <p className="text-lg mb-6 text-gray-900 dark:text-white">
          {currentQuestion.text}
        </p>
        
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={`${currentQuestion.id}-option-index-${index}`}
              className={`flex items-center space-x-2 p-3 rounded-lg border ${
                showExplanation && index === currentQuestion.correctAnswer
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : showExplanation && index.toString() === selectedAnswer
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label 
                htmlFor={`option-${index}`}
                className="flex-grow text-gray-900 dark:text-white"
              >
                {option}
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

