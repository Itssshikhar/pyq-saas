import { QuestionView } from '@/components/QuestionView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Using the exact type that Next.js expects for server components
type PageProps = {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PracticePage(props: PageProps) {
  // Await both params and searchParams at the start
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams
  ])

  // Now we can safely use the subject from our resolved params
  const formattedSubject = params.subject
    ? params.subject.replace(/-/g, ' ')
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
      {params.subject ? (
        <QuestionView subject={params.subject} />
      ) : (
        <p className="text-red-500">Subject is not available.</p>
      )}
    </div>
  )
}