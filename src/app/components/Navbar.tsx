'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-blue-900 border-b border-blue-800 backdrop-blur-sm bg-opacity-80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <span className="text-yellow-400 text-xl font-extrabold">
              WinDay
              <span className="inline-block w-2 h-2 bg-yellow-400 transform rotate-12 ml-1" 
                    style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
              </span>
            </span>
          </Link>

          {session ? (
            <div className="flex items-center space-x-4">
              <Link 
                href="/journal/new"
                className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition font-semibold text-sm"
              >
                🏅 New Entry
              </Link>
              <Link 
                href="/journal"
                className="text-blue-200 hover:text-white transition text-sm"
              >
                Journal
              </Link>
              <Link 
                href="/templates"
                className="text-blue-200 hover:text-white transition text-sm"
              >
                Templates
              </Link>
              <button
                onClick={() => signOut()}
                className="text-blue-200 hover:text-white transition text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin"
                className="text-blue-200 hover:text-white transition text-sm"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition font-semibold text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
