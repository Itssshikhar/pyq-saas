import { QuestionView } from '@/components/QuestionView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Even though TypeScript suggests these are synchronous, Next.js treats them as async
interface PageProps {
  params: {
    subject: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function PracticePage({
  params,
}: PageProps) {
  // We need to await the entire params object first
  const resolvedParams = await Promise.resolve(params)
  // Then we need to await the subject property specifically
  const resolvedSubject = await Promise.resolve(resolvedParams.subject)
  
  // Now we can safely use the resolved subject
  const formattedSubject = resolvedSubject 
    ? resolvedSubject.replace(/-/g, ' ') 
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
      {resolvedSubject ? (
        <QuestionView subject={resolvedSubject} />
      ) : (
        <p className="text-red-500">Subject is not available.</p>
      )}
    </div>
  )
}