'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Goals', href: '/goals' },
    { name: 'Journal', href: '/journal' },
    { name: 'Scorecard', href: '/scorecard' },
    { name: 'Perfect Day', href: '/perfect-day' },
    { name: 'Workouts', href: '/workouts' },
    { name: 'Quotes', href: '/quotes' }
  ];

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl hover:text-gray-300 transition-colors">
                WinDay
              </Link>
            </div>
            <div className="hidden md:block">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
