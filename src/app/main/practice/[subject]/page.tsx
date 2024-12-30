import { QuestionView } from '@/components/QuestionView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function PracticePage({
  params,
}: {
  params: { subject: string }
}) {
  // Await params.subject for proper asynchronous resolution
  const subject = params?.subject ? params.subject.replace(/-/g, ' ') : 'Unknown Subject'

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
          {subject}
        </h1>
      </div>
      {params?.subject ? (
        <QuestionView subject={params.subject} />
      ) : (
        <p className="text-red-500">Subject is not available.</p>
      )}
    </div>
  )
}
