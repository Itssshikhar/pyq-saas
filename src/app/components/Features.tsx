import { BookOpen, Users, Clock, Award } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: "10,000+ GATE Questions",
    description: "Comprehensive question bank covering all GATE subjects"
  },
  {
    icon: Users,
    title: "Expert-Verified Content",
    description: "Questions and explanations reviewed by GATE toppers"
  },
  {
    icon: Clock,
    title: "Smart Practice Mode",
    description: "Adaptive learning system that focuses on your weak areas"
  },
  {
    icon: Award,
    title: "Performance Analytics",
    description: "Detailed insights into your progress and areas for improvement"
  }
]

export default function Features() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-black text-center mb-8">Why Choose PYQadda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl text-black font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

