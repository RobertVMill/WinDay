'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

function UserAvatar({ name }: { name: string | null }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500'
  ];
  // Use the initial to consistently pick a color
  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center text-white font-medium`}>
      {initial}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) =>
    pathname === path
      ? 'text-blue-600'
      : 'text-gray-600 hover:text-gray-900';

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                WinDay
              </Link>
            </div>
            {status === 'authenticated' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/journal/new"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname === '/journal/new'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent ' + isActive('/journal/new')
                  }`}
                >
                  New Entry
                </Link>
                <Link
                  href="/journal"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname === '/journal'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent ' + isActive('/journal')
                  }`}
                >
                  Journal
                </Link>
                <Link
                  href="/templates"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname === '/templates'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent ' + isActive('/templates')
                  }`}
                >
                  Templates
                </Link>
                <Link
                  href="/quotes/new"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    pathname === '/quotes/new'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent ' + isActive('/quotes/new')
                  }`}
                >
                  Add Quote
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : status === 'authenticated' ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <UserAvatar name={session.user?.name} />
                  <span className="text-sm font-medium text-gray-900">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
