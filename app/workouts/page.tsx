'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface WorkoutEntry {
  workout_category: string;
  workout_notes: string;
  date: string;
}

interface WorkoutSummary {
  category: string;
  displayName: string;
  latestEntry?: WorkoutEntry;
}

export default function WorkoutsPage() {
  const [workoutSummaries, setWorkoutSummaries] = useState<WorkoutSummary[]>([
    { category: 'upper_body', displayName: 'Upper Body Strength' },
    { category: 'lower_body', displayName: 'Lower Body Strength' },
    { category: 'endurance', displayName: 'Endurance' }
  ]);

  useEffect(() => {
    fetchLatestWorkouts();
  }, [fetchLatestWorkouts]);

  const fetchLatestWorkouts = async () => {
    try {
      const summaries = await Promise.all(
        workoutSummaries.map(async (summary) => {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('workout_notes, workout_category, date')
            .eq('workout_category', summary.category)
            .order('date', { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error(`Error fetching ${summary.category}:`, error);
          }

          return {
            ...summary,
            latestEntry: data as WorkoutEntry
          };
        })
      );

      setWorkoutSummaries(summaries);
    } catch (error) {
      console.error('Error fetching workout summaries:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Workouts</h1>
      
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workoutSummaries.map((summary) => (
          <div
            key={summary.category}
            className="bg-white/5 p-6 rounded-lg shadow-lg border border-gray-200/20 hover:border-gray-200/40 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-4">{summary.displayName}</h2>
            
            {summary.latestEntry ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Last workout: {formatDate(summary.latestEntry.date)}
                </p>
                <div className="prose prose-sm dark:prose-invert">
                  <h3 className="text-sm font-medium text-gray-300">Notes:</h3>
                  <p className="text-gray-400 whitespace-pre-wrap">
                    {summary.latestEntry.workout_notes}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No workouts recorded yet</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
