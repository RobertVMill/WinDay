'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QuoteDisplay from '../components/QuoteDisplay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export default function GoalsPage() {
  const [vision, setVision] = useState<NorthStarVision | null>(null);
  const [empireGoals, setEmpireGoals] = useState<EmpireGoal[]>([]);
  const [currentSubscribers, setCurrentSubscribers] = useState(0);
  const [subscriberGoal] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subGoals = [
    {
      empire: 'mind',
      title: 'Expand Mind Empire',
      goals: [
        'Major Goal: Read 10 Books by April 29th, 2024',
        'Major Goal: Create 10 AI Apps on LinkedIn',
        'Daily: Study and write about AI',
        'Weekly: Share valuable insights'
      ]
    },
    {
      empire: 'gut',
      title: 'Grow Gut Empire',
      goals: [
        'Major Goal: Maintain Perfect Health (Never Sick)',
        'Major Goal: Achieve Peak Energy (Never Fatigued)',
        'Major Goal: Develop Super Jawline',
        'Daily: Clean bench and workspace'
      ]
    },
    {
      empire: 'body',
      title: 'Strengthen Body Empire',
      goals: [
        'Major Goal: Power Clean 275 lbs',
        'Major Goal: Bench Press 225 lbs x 10',
        'Major Goal: 20K Run under 1 hour',
        'Daily: Complete workout routine'
      ]
    },
    {
      empire: 'heart',
      title: 'Nurture Heart Empire',
      goals: [
        'Major Goal: 100 Birthday Wishes (2024)',
        'Major Goal: 150 Birthday Wishes (2025)',
        'Daily: Send birthday wishes',
        'Weekly: Community engagement'
      ]
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch subscribers count
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('count')
        .single();
      
      if (!subscribersError && subscribersData) {
        setCurrentSubscribers(subscribersData.count);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <QuoteDisplay variant="banner" autoRefresh={true} refreshInterval={300000} />
        
        {/* Main Milestone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Current Mission</h1>
          
          {/* Personal Mission Statement */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 rounded-lg mb-6">
            <p className="text-xl font-bold italic">"Bert, you are the only one who can become the CEOlympian, that is your purpose to achieve."</p>
          </div>
          
          {/* Subscriber Goal */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">Primary Goal</h2>
            <p className="text-lg mb-4">{subscriberGoal} Subscribers by April 29th, 2025</p>
            <div className="bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${(currentSubscribers / subscriberGoal) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-right font-medium">
              {currentSubscribers}/{subscriberGoal} Subscribers
            </div>
          </div>

          {/* Sub Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subGoals.map((section) => (
              <div 
                key={section.empire}
                className={`p-6 rounded-lg ${
                  section.empire === 'mind' ? 'bg-blue-50 dark:bg-blue-900/30' :
                  section.empire === 'body' ? 'bg-green-50 dark:bg-green-900/30' :
                  section.empire === 'heart' ? 'bg-red-50 dark:bg-red-900/30' :
                  'bg-purple-50 dark:bg-purple-900/30'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  section.empire === 'mind' ? 'text-blue-700 dark:text-blue-300' :
                  section.empire === 'body' ? 'text-green-700 dark:text-green-300' :
                  section.empire === 'heart' ? 'text-red-700 dark:text-red-300' :
                  'text-purple-700 dark:text-purple-300'
                }`}>{section.title}</h3>
                <ul className="space-y-3">
                  {section.goals.map((goal, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <input type="checkbox" className="mt-1.5 h-4 w-4" />
                      <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
