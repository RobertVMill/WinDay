'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-b border-blue-800/50 backdrop-blur-md bg-opacity-90 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="relative">
              <span className="text-yellow-400 text-2xl font-black tracking-tight group-hover:text-yellow-300 transition-colors">
                WinDay
              </span>
              <span className="absolute -top-1 -right-3 w-3 h-3 bg-yellow-400 transform rotate-12 group-hover:rotate-45 transition-transform duration-300" 
                    style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
              </span>
            </div>
          </Link>

          {session ? (
            <div className="flex items-center space-x-6">
              <Link 
                href="/journal/new"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-5 py-2.5 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🏅 New Victory
              </Link>
              <div className="flex items-center space-x-8">
                <Link 
                  href="/journal"
                  className="text-blue-100 hover:text-yellow-400 transition-colors duration-300 text-sm font-semibold relative group"
                >
                  Journal
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/templates"
                  className="text-blue-100 hover:text-yellow-400 transition-colors duration-300 text-sm font-semibold relative group"
                >
                  Templates
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-blue-200 hover:text-white transition-colors duration-300 text-sm font-semibold bg-blue-800/30 px-4 py-2 rounded-lg hover:bg-blue-800/50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link 
                href="/auth/signin"
                className="text-blue-100 hover:text-yellow-400 transition-colors duration-300 text-sm font-semibold relative group"
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-5 py-2.5 rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Winning
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
