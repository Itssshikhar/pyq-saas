import { QuestionView } from '@/components/QuestionView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// Define the shape of our parameters
type PageParams = {
  subject: string;
}

// Define our props type that expects params to be a Promise
type Props = {
  params: Promise<PageParams>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PracticePage(props: Props) {
  // First, await the entire params object
  const resolvedParams = await props.params
  
  // Format the subject string after we have resolved the params
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