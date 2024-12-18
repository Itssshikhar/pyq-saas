'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Hero() {
  const { user, signInWithGoogle } = useAuth();

  const handleAuthAction = () => {
    if (!user) {
      signInWithGoogle();
    } else {
      // Redirect to practice page or show practice modal
      console.log('User is logged in, redirect to practice page');
    }
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-black">
              <span className="text-purple-600">Master GATE</span> with high yield previous year questions
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Unlock your dream engineering career with PYQadda's unmatched question bank! Learn smarter, not harder by practicing Previous Year Questions (PYQs) and accessing our concise, focused notes.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                {user ? 'Practice Questions Now' : 'Sign in to Practice'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleAuthAction}
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-800 font-semibold rounded-lg hover:border-gray-300 transition-colors"
              >
                {user ? 'Get Free Daily Questions' : 'Sign in for Free Questions'}
              </button>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="public/DALL·E-2024-12-18-23.28.svg"
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

