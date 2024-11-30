'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Welcome to WinDay</h1>
        <p className="text-lg text-gray-600 mb-8">Track your journey to greatness.</p>
        <Link 
          href="/auth/signin"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Enter App
        </Link>
      </div>
    </main>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">WinDay</h1>
          <p className="text-xl text-gray-300 mb-8">Track your journey to greatness</p>
          <Link 
            href="/app" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Enter App
          </Link>
        </div>
      </div>
    </div>
  );
}
