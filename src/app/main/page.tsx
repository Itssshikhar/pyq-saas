import { SubjectList } from '../components/SubjectList'

export default function MainPage() {
  return (
    <div className="text-primary">
      <h1 className="text-2xl font-bold mb-6 text-foreground">GATE Subjects</h1>
      <SubjectList />
    </div>
  )
}