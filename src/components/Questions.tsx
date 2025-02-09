'use client';

import { useEffect, useState } from 'react';
import { Question } from '@/lib/types/question';
import { getQuestions } from '@/lib/api/questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [subject, setSubject] = useState<string | undefined>();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions({ page, subject });
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, subject]);

  if (loading) return <div className="flex justify-center p-8">Loading questions...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center gap-4">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">Mathematics</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="font-bold">Question {question.number}:</span> {question.text}
              </div>
              
              {question.statements.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold mb-2">Statements:</div>
                  <ul className="list-disc pl-6">
                    {question.statements.map((statement, index) => (
                      <li key={`${question.id}-statement-${index}`}>{statement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {question.options.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Options:</div>
                  <div className="grid gap-2">
                    {question.options.map((option, index) => (
                      <div key={`${question.id}-option-index-${index}`} className="flex gap-2">
                        <span className="font-medium">{option.label})</span>
                        <span>{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.images.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">Images:</div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {question.images.map((image, index) => (
                      <img
                        key={`${question.id}-image-${index}`}
                        src={image}
                        alt={`Question ${question.number} - Image ${index + 1}`}
                        className="max-w-full h-auto rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={questions.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 