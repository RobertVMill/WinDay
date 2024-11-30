'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">WinDay</h1>
          <p className="text-xl text-gray-300 mb-8">Track your journey to greatness</p>
          <Link 
            href="/goals" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Enter App
          </Link>
        </div>
      </div>
    </div>
  );
}
