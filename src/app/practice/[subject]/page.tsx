import { QuestionView } from '@/app/components/QuestionView';

// Define the type for params
type Params = Promise<{ subject: string }>;

export default async function PracticePage({ params }: { params: Params }) {
  // Await params to resolve it
  const resolvedParams = await params;

  return (
    <div className="container mx-auto p-6">
      <QuestionView subject={resolvedParams.subject} />
    </div>
  );
}
