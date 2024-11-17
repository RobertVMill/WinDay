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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900">
            DayFlow
          </h1>
          <p className="text-xl text-gray-600">
            Your daily companion for reflection, gratitude, and growth
          </p>
          
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full max-w-md"
                >
                  Start Today&apos;s Entry
                </Link>
                <Link
                  href="/journal" 
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg border hover:bg-gray-50 transition w-full max-w-md"
                >
                  View Journal
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white border rounded-lg p-6 space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Welcome to Your Journal!</h2>
                  <p className="text-gray-600">
                    Let&apos;s start by creating your personal journal template. You can:
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Start from Scratch</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Create your own custom template with exactly the sections you want.
                      </p>
                      <Link
                        href="/template-builder"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Create Custom Template
                      </Link>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Use a Template</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Browse our collection of pre-made templates and customize them.
                      </p>
                      <Link
                        href="/templates"
                        className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Browse Templates
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
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