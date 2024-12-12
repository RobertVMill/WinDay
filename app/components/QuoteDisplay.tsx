'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface Quote {
  id: number;
  quote: string;
  title: string | null;
  created_at: string;
}

interface QuoteDisplayProps {
  variant?: 'minimal' | 'card' | 'banner';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  empire?: 'mind' | 'body' | 'heart' | 'gut';
}

export default function QuoteDisplay({ 
  variant = 'card', 
  autoRefresh = false, 
  refreshInterval = 60000, // default 1 minute
  empire 
}: QuoteDisplayProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRandomQuote = useCallback(async () => {
    try {
      let query = supabase
        .from('quotes')
        .select('*');
      
      if (empire) {
        query = query.eq('title', empire);
      }
      
      const { data: quotes, error } = await query;

      if (error) throw error;
      if (quotes && quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setLoading(false);
    }
  }, [empire]);

  useEffect(() => {
    fetchRandomQuote();
  }, [fetchRandomQuote]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchRandomQuote, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRandomQuote, refreshInterval]);

  if (loading) {
    return <div className="animate-pulse">Loading wisdom...</div>;
  }

  if (!currentQuote) {
    return null;
  }

  switch (variant) {
    case 'minimal':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
          "{currentQuote.quote}"
          {currentQuote.title && <span className="block text-xs mt-1">- {currentQuote.title}</span>}
        </div>
      );

    case 'banner':
      return (
        <div className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 mb-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">"{currentQuote.quote}"</p>
              {currentQuote.title && <p className="text-sm mt-1">- {currentQuote.title}</p>}
            </div>
            <button
              onClick={fetchRandomQuote}
              className="ml-4 bg-white/10 hover:bg-white/20 rounded-full p-2"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'card':
    default:
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium dark:text-white">"{currentQuote.quote}"</p>
              {currentQuote.title && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">- {currentQuote.title}</p>
              )}
            </div>
            <button
              onClick={fetchRandomQuote}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
  }
}

function RefreshIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
