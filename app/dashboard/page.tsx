'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AITool {
  id: number;
  name: string;
  company: string;
  category: string;
  description: string;
  use_cases: string[];
  pricing: string;
  launch_date: string;
  rating: number;
  reviews: number;
  url: string;
}

export default function Dashboard() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Text Generation',
    'Image Generation',
    'Code Generation',
    'Voice/Speech',
    'Data Analysis',
    'Customer Service',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
  ];

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, searchQuery]);

  async function fetchTools() {
    let query = supabase
      .from('ai_tools')
      .select('*')
      .order('launch_date', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }

    setTools(data || []);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Tool Discovery</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and compare the latest AI tools for your business
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search AI tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div key={tool.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {tool.company}</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {tool.category}
                </span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {tool.description}
              </p>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Use Cases:</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.use_cases.map((useCase, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Launched: {new Date(tool.launch_date).toLocaleDateString()}</span>
                <span>{tool.pricing}</span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= tool.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({tool.reviews})
                  </span>
                </div>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
