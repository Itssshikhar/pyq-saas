import { QuestionView } from '@/app/components/QuestionView'

export default function PracticePage({
  params
}: {
  params: { subject: string }
}) {
  return (
    <div className="container mx-auto p-6">
      <QuestionView subject={params.subject} />
    </div>
  )
}