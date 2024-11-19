'use client';

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'

interface Template {
  id: string;
  name: string;
  description?: string;
  userId: string | null;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTemplates();
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch templates');
      }
      const data = await response.json();
      // Only show templates owned by the current user
      const userTemplates = data.filter((t: Template) => t.userId === session?.user?.id);
      setTemplates(userTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-2xl text-center space-y-8">
          <div className="relative">
            <h1 className="text-6xl font-extrabold text-white tracking-tight">
              WinDay
              <span className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 transform rotate-12 rounded-sm" 
                    style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
              </span>
            </h1>
            <p className="text-xl text-blue-200 mt-4 font-medium">
              Win Every Day Like a Champion 🏆
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              {error}
            </div>
          )}
          
          {status === 'authenticated' ? (
            templates.length > 0 ? (
              <div className="flex flex-col gap-4 items-center">
                <Link 
                  href="/journal/new" 
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg hover:bg-yellow-300 transition w-full max-w-md font-bold text-lg transform hover:scale-105 hover:shadow-xl"
                >
                  🏅 Start Today&apos;s Entry
                </Link>
                <Link
                  href="/journal" 
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg border border-white/20 hover:bg-white/20 transition w-full max-w-md font-semibold"
                >
                  View Your Legacy
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 space-y-6">
                  <h2 className="text-3xl font-bold text-white">Time to Build Your Legacy! 🌟</h2>
                  <p className="text-blue-200">
                    Choose your path to greatness:
                  </p>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-blue-800/50 p-6 rounded-lg transform hover:scale-105 transition">
                      <h3 className="font-bold text-yellow-400 text-xl mb-3">Create Your Playbook</h3>
                      <p className="text-blue-200 mb-4">
                        Design your custom template like a champion crafting their perfect game plan.
                      </p>
                      <Link
                        href="/template-builder"
                        className="inline-block bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg hover:bg-yellow-300 transition font-bold"
                      >
                        Build Your Strategy
                      </Link>
                    </div>
                    <div className="bg-blue-800/50 p-6 rounded-lg transform hover:scale-105 transition">
                      <h3 className="font-bold text-yellow-400 text-xl mb-3">Choose a Winning Template</h3>
                      <p className="text-blue-200 mb-4">
                        Start with proven strategies from our championship collection.
                      </p>
                      <Link
                        href="/templates"
                        className="inline-block bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition font-bold"
                      >
                        Browse Templates
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-blue-200">
                  You can always create more templates or modify existing ones later.
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full max-w-md"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 transition"
              >
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}