import Image from 'next/image'
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Master GATE with our <span className="text-purple-600">Powerful Features</span>
          </h2>
          <p className="text-gray-600">
            Everything you need to excel in your GATE examination preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Practice Real GATE Questions</h3>
            <p className="text-gray-600 mb-6">
              Sharpen your focus and conquer high-yield topics with our massive, subject & topic-wise online Question Bank featuring 10,000+ GATE questions. Maximize your score and identify frequently tested areas.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <feature.icon className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-2xl" />
            <div className="relative h-[600px]">
              <Image
                src="/placeholder.svg?height=600&width=400"
                alt="PYQadda App Interface"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

