import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Reflex Prep - Redesign</title>
        <meta name="description" content="Master your skills with Reflex Prep." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-6">Crack GATE with Precision and Confidence!</h1>
          <p className="text-lg font-light mb-8">India's smartest way to prepare for the GATE exam with AI-powered insights and personalized analytics.</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-teal-600 py-3 px-6 rounded-md shadow-md font-bold hover:bg-gray-200">
              Start Your Journey
            </button>
            <button className="border border-white py-3 px-6 rounded-md text-white hover:bg-white hover:text-teal-600">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Features Designed for GATE Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: 'AI Mock Tests', description: 'Simulate real exam environments.' },
              { icon: '📈', title: 'Performance Analytics', description: 'Identify strengths and improve weaknesses.' },
              { icon: '📚', title: 'Topic Mastery', description: 'Track your progress topic by topic.' },
            ].map(({ icon, title, description }) => (
              <div key={title} className="p-6 bg-white shadow-lg rounded-md hover:shadow-xl">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects we cover */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Subjects We Cover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {['Mechanical Engineering', 'Electrical Engineering', 'Computer Science', 'Civil Engineering'].map((subject) => (
              <div key={subject} className="bg-white p-4 shadow-md rounded-md hover:scale-105 transition-transform">
                <h3 className="text-lg font-semibold text-gray-700">{subject}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="bg-gradient-to-r from-gray-100 to-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Us?</h2>
          <ul className="space-y-4 text-gray-600 text-lg">
            <li>✅ AI-powered feedback tailored for GATE aspirants.</li>
            <li>✅ Topic-wise question banks curated by experts.</li>
            <li>✅ Real-time analytics to visualize growth.</li>
          </ul>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="bg-teal-600 text-white py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Excel in GATE?</h2>
          <p className="text-lg mb-6">Join thousands of successful students on their journey to GATE success.</p>
          <button className="bg-white text-teal-600 font-bold py-3 px-6 rounded-md shadow-lg hover:bg-gray-200">
            Get Started for Free
          </button>
        </div>
      </section>
    </>
  );
}
