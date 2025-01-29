import Questions from '@/components/Questions'

export default function MainPage() {
  return (
    <div className="text-primary">
      <h1 className="text-2xl font-bold mb-6 text-foreground">GATE Questions</h1>
      <Questions />
    </div>
  )
}