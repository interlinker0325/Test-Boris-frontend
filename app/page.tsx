import Chatbot from '@/components/Chatbot'
import Link from 'next/link'
import { History } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/history"
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-blue-600"
        >
          <History className="w-5 h-5" />
          <span className="font-medium">View History</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chatbot Demo
        </h1>
      </div>
      
      {/* Chatbot Component */}
      <Chatbot />
    </main>
  )
}
