'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Hero() {
  const { user, signIn } = useAuth()

  const handleAuthAction = async () => {
    if (!user) {
      await signIn()
    }
  }

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl text-black font-bold leading-tight">
              <span className="text-purple-600">Master GATE</span> with high yield previous year questions
            </h1>
            <p className="text-lg text-black max-w-lg">
              Unlock your dream engineering career with PYQadda's unmatched question bank! Learn smarter, not harder by practicing Previous Year Questions (PYQs) and accessing our concise, focused notes.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                {user ? 'Go to Dashboard' : 'Sign in to Practice'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/placeholder.svg?height=500&width=600"
              alt="GATE Aspirants"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
