import { SubjectList } from '@/app/components/SubjectList'

export default function MainPage() {
  return (
    <div>
      <h1 className="text-2xl text-black font-bold mb-6 text-gray-900 dark:text-white">GATE Subjects</h1>
      <SubjectList />
    </div>
  )
}