'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QuoteDisplay from '../components/QuoteDisplay';

interface NorthStarVision {
  id: number;
  content: string;
  notes: string | null;
  is_active: boolean;
}

interface EmpireGoal {
  id: number;
  empire: string;
  content: string;
  target_date: string | null;
  completed: boolean;
}

interface DailyAction {
  id: number;
  empire: string;
  action: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarPage() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [vision, setVision] = useState<string | null>(null);
  const [empireGoals, setEmpireGoals] = useState<any[]>([]);
  const [dailyActions, setDailyActions] = useState<any[]>([]);

  // Cache goals data
  const goalsCache = useRef<{
    data: {
      vision: string | null;
      empireGoals: any[];
      dailyActions: any[];
    } | null;
    lastFetched: number;
    cacheDuration: number;
  }>({
    data: null,
    lastFetched: 0,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    fetchGoalsData();
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchGoalsData = async () => {
    const fetchGoals = async () => {
      const now = Date.now();
      if (goalsCache.current.data && (now - goalsCache.current.lastFetched) < goalsCache.current.cacheDuration) {
        if (goalsCache.current.data) {
          setVision(goalsCache.current.data.vision);
          setEmpireGoals(goalsCache.current.data.empireGoals);
          setDailyActions(goalsCache.current.data.dailyActions);
        }
        return;
      }

      try {
        const [visionData, empireGoalsData, dailyActionsData] = await Promise.all([
          supabase.from('north_star_vision').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('empire_goals').select('*').order('created_at', { ascending: true }),
          supabase.from('daily_actions').select('*').order('created_at', { ascending: true })
        ]);

        const goalsData = {
          vision: visionData?.data?.content || null,
          empireGoals: empireGoalsData?.data || [],
          dailyActions: dailyActionsData?.data || []
        };

        // Update cache
        goalsCache.current = {
          ...goalsCache.current,
          lastFetched: now,
          data: goalsData
        };

        setVision(goalsData.vision);
        setEmpireGoals(goalsData.empireGoals);
        setDailyActions(goalsData.dailyActions);
      } catch (error) {
        console.error('Error fetching goals data:', error);
      }
    };
    await fetchGoals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    const newMessages = [...messages, { role: 'user' as const, content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          goalsContext: {
            vision,
            empireGoals,
            dailyActions
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant' as const, content: data.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending your message');
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
      // Scroll to bottom of chat
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <QuoteDisplay variant="banner" autoRefresh={true} refreshInterval={300000} />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '80vh' }}>
          {/* Chat Header */}
          <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Schedule Assistant</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              I'm here to help you set and achieve your goals through effective scheduling. Let's start by discussing your goals!
            </p>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 dark:bg-red-700 rounded-lg p-3">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
            {typingIndicator && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={handleSubmit} 
            className="p-4 border-t dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share your goals or ask for scheduling advice..."
                className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
