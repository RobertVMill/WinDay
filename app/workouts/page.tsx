'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteDisplay from '../components/QuoteDisplay';

interface WorkoutEntry {
  workout_category: string;
  workout_notes: string;
  date: string;
}

interface WorkoutPhase {
  name: string;
  description: string;
}

interface WorkoutType {
  category: string;
  displayName: string;
  phases?: WorkoutPhase[];
  latestEntry?: WorkoutEntry;
}

export default function WorkoutsPage() {
  const [workoutSummaries, setWorkoutSummaries] = useState<WorkoutType[]>([
    { 
      category: 'upper_body', 
      displayName: 'Upper Body Strength',
      phases: [
        { 
          name: 'Warm Up (10 min)', 
          description: 'Break a sweat, activate muscles, prepare for intensity'
        },
        { 
          name: 'Shock Reps', 
          description: 'Heavy weight, low reps - shock the system'
        },
        { 
          name: 'Performance Sets', 
          description: 'Push for new records, maximum effort'
        },
        { 
          name: 'Damage Sets', 
          description: 'High rep ranges, accumulate volume'
        },
        { 
          name: 'Flashy Set', 
          description: 'Explosive, dynamic movements'
        },
        { 
          name: 'Burnout', 
          description: 'Push to failure, empty the tank'
        },
        { 
          name: 'Cool Down', 
          description: 'Stretch and recover'
        }
      ]
    },
    { 
      category: 'lower_body', 
      displayName: 'Lower Body Strength',
      phases: [
        { 
          name: 'Warm Up (10 min)', 
          description: 'Break a sweat, activate muscles, prepare for intensity'
        },
        { 
          name: 'Shock Reps', 
          description: 'Heavy weight, low reps - shock the system'
        },
        { 
          name: 'Performance Sets', 
          description: 'Push for new records, maximum effort'
        },
        { 
          name: 'Damage Sets', 
          description: 'High rep ranges, accumulate volume'
        },
        { 
          name: 'Flashy Set', 
          description: 'Explosive, dynamic movements'
        },
        { 
          name: 'Burnout', 
          description: 'Push to failure, empty the tank'
        },
        { 
          name: 'Cool Down', 
          description: 'Stretch and recover'
        }
      ]
    },
    { 
      category: 'endurance', 
      displayName: 'Endurance'
    }
  ]);

  const fetchLatestWorkouts = useCallback(async () => {
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
  }, [workoutSummaries]);

  useEffect(() => {
    fetchLatestWorkouts();
  }, [fetchLatestWorkouts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-spaceGrotesk">
      <QuoteDisplay variant="banner" autoRefresh={true} refreshInterval={300000} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Workout Performance Tracking</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workoutSummaries.map((summary) => (
            <div
              key={summary.category}
              className="bg-white/5 p-6 rounded-lg shadow-lg border border-gray-200/20 hover:border-gray-200/40 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-4">{summary.displayName}</h2>
              
              {summary.phases && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Workout Phases:</h3>
                  <div className="space-y-3">
                    {summary.phases.map((phase, index) => (
                      <div 
                        key={phase.name}
                        className="bg-white/5 p-3 rounded-md border border-gray-200/10"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-medium">{index + 1}.</span>
                          <h4 className="text-sm font-medium text-gray-200">{phase.name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-6">
                          {phase.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {summary.latestEntry ? (
                <div className="space-y-3 border-t border-gray-200/10 pt-4 mt-4">
                  <p className="text-sm text-gray-400">
                    Last performance: {formatDate(summary.latestEntry.date)}
                  </p>
                  <div className="prose prose-sm dark:prose-invert">
                    <h3 className="text-sm font-medium text-gray-300">Performance Notes:</h3>
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
      </div>
    </div>
  );
}
