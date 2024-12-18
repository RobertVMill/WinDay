'use client';

import { useEffect, useState, useCallback } from 'react';
import WeeklySchedule, { ScheduleBlock } from '../components/WeeklySchedule';
import { supabase } from '@/lib/supabase';

type ViewMode = 'today' | 'week';

interface ScheduleBlockExtended extends ScheduleBlock {
  id: number;
  activity: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  completed: boolean;
  day_type: string;
  notes?: string;
  instruction?: string;
  day_of_week: number;
}

export default function CalendarPage() {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlockExtended[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  const fetchScheduleBlocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*');

      if (error) throw error;
      if (data) {
        const transformedBlocks = data.map(block => {
          const isSunday = block.day_of_week === 0;
          const activity = block.activity;
          const instruction = undefined;
          
          // Update durations based on activity type
          let duration = 0; // in minutes
          switch (block.activity.toLowerCase()) {
            case 'sun salutations':
              duration = 5;
              break;
            case 'meditation':
              duration = isSunday ? 45 : 30; // 45 mins on weekends, 30 on weekdays
              break;
            case 'journal':
              duration = 15;
              break;
            case 'workout':
            case 'early morning workout':
              duration = 90;
              break;
            case 'morning work':
              duration = 240; // 4 hours
              break;
            case 'lunch':
              duration = 30;
              break;
            case 'afternoon work':
              duration = 240; // 4 hours
              break;
            case 'walk home':
              duration = 30;
              break;
            case 'dinner':
              duration = 40;
              break;
            case 'evening coding':
              duration = 180; // 3 hours
              break;
            case 'yoga':
              duration = 20;
              break;
            case 'wash up':
              duration = 20;
              break;
            case 'read':
              duration = 30;
              break;
            default:
              duration = 60; // default 1 hour for unspecified activities
          }

          // Calculate end_time based on start_time and duration
          const startTime = new Date(`2000-01-01 ${block.start_time}`);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          const formattedEndTime = endTime.toTimeString().slice(0, 5);

          return {
            ...block,
            activity,
            end_time: formattedEndTime,
            duration_minutes: duration,
            completed: false,
            day_type: 'normal',
            notes: block.notes || undefined,
            instruction
          };
        }).filter(Boolean);

        setScheduleBlocks(transformedBlocks);
      }
    } catch (error) {
      console.error('Error in fetchScheduleBlocks:', error);
    }
  }, []);

  useEffect(() => {
    fetchScheduleBlocks();
  }, [fetchScheduleBlocks]);

  const getTodayBlocks = () => {
    const today = new Date();
    return scheduleBlocks.filter(block => block.day_type === 'normal');
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Build Your Empire
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400">
            One process-focused day at a time
          </p>
          <div className="mt-2 text-sm text-gray-500 italic">
            "The process is the empire. Love the process, build the empire."
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'today'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Today's Date */}
        {viewMode === 'today' && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
          </div>
        )}

        {/* Schedule View */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          {viewMode === 'today' ? (
            <div className="space-y-4">
              {getTodayBlocks().map((block, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-white">{block.activity}</h3>
                      <p className="text-sm text-gray-400">
                        {block.start_time} - {block.end_time}
                      </p>
                    </div>
                    {block.instruction && (
                      <div className="text-sm text-gray-400 italic">
                        {block.instruction}
                      </div>
                    )}
                  </div>
                  {block.notes && (
                    <div className="mt-2 text-sm text-gray-400">
                      Note: {block.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <WeeklySchedule blocks={scheduleBlocks} />
          )}
        </div>
      </div>
    </main>
  );
}
