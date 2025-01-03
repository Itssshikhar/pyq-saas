'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

// This would typically come from your API
const questions = [
  {
    id: 1,
    text: "What is the time complexity of quicksort in the average case?",
    options: [
      "O(n)",
      "O(n log n)",
      "O(n²)",
      "O(log n)"
    ],
    correctAnswer: 1,
    explanation: "Quicksort has an average time complexity of O(n log n). This is because in the average case, the partition process divides the array into roughly equal halves, leading to a balanced recursion tree."
  },
  {
    id: 2,
    text: "Which of the following is NOT a characteristic of the Von Neumann architecture?",
    options: [
      "Stored program concept",
      "Separate data and instruction memory",
      "Sequential instruction execution",
      "Binary number system"
    ],
    correctAnswer: 1,
    explanation: "The Von Neumann architecture uses a single memory for both data and instructions. Having separate data and instruction memory is a characteristic of Harvard architecture, not Von Neumann architecture."
  }
]

export function QuestionView({ subject }: { subject: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>()
  const [showExplanation, setShowExplanation] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())

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
    console.log('Clicked Previous:', { isFirstQuestion, currentQuestionIndex });
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => {
        const newIndex = prev - 1;
        console.log('Updating index to:', newIndex);
        return newIndex;
      });
      setSelectedAnswer(undefined);
      setShowExplanation(false);
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
        <p className="text-lg mb-6 text-gray-900 dark:text-gray-100">
          {currentQuestion.text}
        </p>
        
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
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
        onClick={handlePreviousQuestion} 
        disabled={isFirstQuestion}
        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

        {!showExplanation && (
          <Button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className="px-8 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Check Answer
          </Button>
        )}

        <Button
          onClick={handleNextQuestion}
          disabled={isLastQuestion || !hasAnswered}
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

