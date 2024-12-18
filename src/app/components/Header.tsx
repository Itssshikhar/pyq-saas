import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-gray-900">PYQadda</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-600 hover:text-gray-900">Blog</Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900">Practice</Link>
          <div className="flex items-center space-x-3">
            <Link href="#" className="flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=120"
                alt="Download on App Store"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <Link href="#" className="flex items-center">
              <Image
                src="/placeholder.svg?height=40&width=120"
                alt="Get it on Google Play"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}