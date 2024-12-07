'use client';

import { useState, useEffect, useRef } from 'react';

export default function CalendarPage() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, data]);
      } else {
        console.error('Failed to get response:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '80vh' }}>
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
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleSendMessage(); 
          }} 
          className="p-4 border-t dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share your goals or ask for scheduling advice..."
              className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
