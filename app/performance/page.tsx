'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteDisplay from '../components/QuoteDisplay';

interface WorkoutEntry {
  id: number;
  date: string;
  workout_notes: string | null;
  workout_category: string | null;
  best_day: string | null;
}

export default function PerformancePage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, date, workout_notes, workout_category, best_day');

      if (error) throw error;

      const validWorkouts = (data || [])
        .filter(entry => entry.date !== null)
        .map(entry => ({
          ...entry,
          date: entry.date as string
        }));

      setWorkouts(validWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    endurance: workouts.filter(w => w.workout_category === 'endurance'),
    upperStrength: workouts.filter(w => w.workout_category === 'upper_strength'),
    lowerStrength: workouts.filter(w => w.workout_category === 'lower_strength'),
  };

  const renderWorkoutCard = (workout: WorkoutEntry) => (
    <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(workout.date).toLocaleDateString()}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
            {workout.workout_notes}
          </p>
        </div>
        {workout.best_day === 'true' && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Best Day 🏆
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <QuoteDisplay empire="body" />
        
        {/* Category Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('endurance')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'endurance'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Endurance
          </button>
          <button
            onClick={() => setSelectedCategory('upperStrength')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'upperStrength'
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Upper Strength
          </button>
          <button
            onClick={() => setSelectedCategory('lowerStrength')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'lowerStrength'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Lower Strength
          </button>
        </div>

        {/* Workout Lists */}
        <div className="grid grid-cols-1 gap-6">
          {selectedCategory === 'all' ? (
            <>
              {/* Endurance Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Endurance Training
                </h2>
                {categories.endurance.map(renderWorkoutCard)}
              </div>

              {/* Upper Strength Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upper Body Strength
                </h2>
                {categories.upperStrength.map(renderWorkoutCard)}
              </div>

              {/* Lower Strength Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Lower Body Strength
                </h2>
                {categories.lowerStrength.map(renderWorkoutCard)}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {categories[selectedCategory as keyof typeof categories].map(renderWorkoutCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
