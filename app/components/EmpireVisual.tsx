'use client';

import { useState } from 'react';

interface EmpireVisualProps {
  empireDescriptions: {
    mind: string;
    body: string;
    heart: string;
    gut: string;
  };
  progress: {
    mind: number;
    body: number;
    heart: number;
    gut: number;
  };
}

export default function EmpireVisual({ empireDescriptions, progress }: EmpireVisualProps) {
  const [activeEmpire, setActiveEmpire] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] mt-20">
      {/* Body image placeholder */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gray-700/50 rounded-lg border-2 border-gray-600">
          <svg 
            className="w-full h-full text-gray-500 p-12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </div>

        {/* Mind Empire (Head) */}
        <div 
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-24 h-24 cursor-pointer
            ${activeEmpire === 'mind' ? 'ring-4 ring-blue-500' : ''}
            hover:bg-blue-500/20 transition-colors`}
          onMouseEnter={() => setActiveEmpire('mind')}
          onMouseLeave={() => setActiveEmpire(null)}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg shadow-lg whitespace-nowrap">
              <p className="text-sm">{empireDescriptions.mind}</p>
              <div className="mt-1 h-1 bg-blue-200 rounded-full">
                <div 
                  className="h-1 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.mind}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heart Empire */}
        <div 
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full cursor-pointer
            ${activeEmpire === 'heart' ? 'ring-4 ring-red-500' : ''}
            hover:bg-red-500/20 transition-colors`}
          onMouseEnter={() => setActiveEmpire('heart')}
          onMouseLeave={() => setActiveEmpire(null)}
        >
          <div className="absolute top-1/2 left-full transform translate-x-2">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg shadow-lg">
              <p className="text-sm">{empireDescriptions.heart}</p>
              <div className="mt-1 h-1 bg-red-200 rounded-full">
                <div 
                  className="h-1 bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.heart}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gut Empire */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full cursor-pointer
            ${activeEmpire === 'gut' ? 'ring-4 ring-purple-500' : ''}
            hover:bg-purple-500/20 transition-colors`}
          onMouseEnter={() => setActiveEmpire('gut')}
          onMouseLeave={() => setActiveEmpire(null)}
        >
          <div className="absolute top-1/2 right-full transform -translate-x-2">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg shadow-lg">
              <p className="text-sm">{empireDescriptions.gut}</p>
              <div className="mt-1 h-1 bg-purple-200 rounded-full">
                <div 
                  className="h-1 bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.gut}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body Empire (Full Body Overlay) */}
        <div 
          className={`absolute inset-0 rounded-lg cursor-pointer
            ${activeEmpire === 'body' ? 'ring-4 ring-green-500' : ''}
            hover:bg-green-500/10 transition-colors`}
          onMouseEnter={() => setActiveEmpire('body')}
          onMouseLeave={() => setActiveEmpire(null)}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg shadow-lg">
              <p className="text-sm">{empireDescriptions.body}</p>
              <div className="mt-1 h-1 bg-green-200 rounded-full">
                <div 
                  className="h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.body}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
