import { QuestionView } from '@/components/QuestionView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function PracticePage({
  params,
}: {
  params: Promise<{ subject: string }> | { subject: string }
}) {
  // First, we need to await the entire params object
  const resolvedParams = await Promise.resolve(params)
  
  // Now we can safely access the subject property from our resolved params
  const formattedSubject = resolvedParams.subject 
    ? resolvedParams.subject.replace(/-/g, ' ') 
    : 'Unknown Subject'

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/main">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
          {formattedSubject}
        </h1>
      </div>
      {resolvedParams.subject ? (
        <QuestionView subject={resolvedParams.subject} />
      ) : (
        <p className="text-red-500">Subject is not available.</p>
      )}
    </div>
  )
}