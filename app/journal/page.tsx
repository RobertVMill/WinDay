'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DEFAULT_STRATEGY = `Trust the process. Love the work. Believe in your destiny. Build consistent momentum.

🧍🏽‍♂️ BODY POWERFUL
- Make world class workouts automatic
- Fast til the afternoon
- Sleep as long and deep as you can

🧠 MIND SHARP
- Keep finding dopamine during work
- Make your clients euphoric
- Listen your ass of
- Leverage weekends for deep work

🦠 GUT FLOURISHING
- Go big on fiber and protein
- No sugar or salt
- Low sugar & sodium
- Eat slowly, and until you're comfortably full

❤️ Heart
- Meditate on love
- Give 10X every time, doesn't matter who the person is
- Get back to people ASAP, doesn't matter who the person is
- Connect with people as often as possbile`;

interface JournalEntry {
  id: number;
  date: string;
  gratitude: string;
  gifts: string;
  strategy: string;
  strategy_checks?: Record<string, boolean>;
  best_day: string;
  image_url: string;
  workout_notes: string;
  workout_category: string;
  deep_flow_activity: string;
}

function parseStrategy(strategy: string): { text: string; items: string[] }[] {
  const sections = strategy.split('\n\n');
  return sections.map(section => {
    const [title, ...items] = section.split('\n');
    return {
      text: title,
      items: items.filter(item => item.startsWith('- ')).map(item => item.substring(2))
    };
  });
}

function StrategySection({ strategy, checks, onToggle }: { 
  strategy: string; 
  checks?: Record<string, boolean>;
  onToggle?: (item: string, checked: boolean) => void;
}) {
  const sections = parseStrategy(strategy);
  
  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <div className="font-medium">{section.text}</div>
          {section.items.map((item, itemIdx) => (
            <div key={itemIdx} className="flex items-start gap-2 ml-4">
              <input
                type="checkbox"
                checked={checks?.[item] || false}
                onChange={(e) => onToggle?.(item, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={checks?.[item] ? 'line-through text-gray-500' : ''}>
                {item}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PreviousEntries({ onEntryClick }: { onEntryClick: (entry: JournalEntry) => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const fetchEntries = useCallback(async (startIndex: number) => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false })
        .range(startIndex, startIndex + 9);

      if (error) throw error;

      if (data) {
        if (data.length < 10) {
          setHasMore(false);
        }
        if (startIndex === 0) {
          setEntries(data);
        } else {
          setEntries(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading]);

  const lastEntryRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchEntries(entries.length);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchEntries]);

  useEffect(() => {
    fetchEntries(0);
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [fetchEntries]);

  return (
    <div className="mb-8 font-spaceGrotesk">
      <div 
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center justify-between cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
      >
        <h2 className="text-xl font-bold text-white mb-0">Previous Entries</h2>
        <svg 
          className={`w-5 h-5 text-gray-400 transform transition-transform ${isVisible ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isVisible && (
        <div className="grid grid-cols-1 gap-3 mt-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              ref={index === entries.length - 1 ? lastEntryRef : undefined}
              onClick={() => onEntryClick(entry)}
              className="bg-gray-800/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors border border-gray-700/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{entry.gratitude}</p>
                </div>
                {entry.image_url && (
                  <div className="w-12 h-12 ml-3 flex-shrink-0 relative">
                    <Image
                      src={entry.image_url}
                      alt="Journal entry"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-4">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          )}
          {!hasMore && entries.length > 0 && (
            <div className="text-center text-gray-500 text-sm py-2">
              No more entries to load
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EntryDetail({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {new Date(entry.date).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {entry.image_url && (
          <div className="mb-4">
            <Image
              src={entry.image_url}
              alt="Journal entry"
              width={400}
              height={200}
              className="w-full h-64 object-cover rounded"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Gratitude</h3>
            <p className="text-gray-300">{entry.gratitude}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Gifts Given</h3>
            <p className="text-gray-300">{entry.gifts}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Strategy</h3>
            <p className="text-gray-300">{entry.strategy}</p>
          </div>
          
          {entry.workout_notes && (
            <div>
              <h3 className="text-lg font-semibold text-white">Workout Notes from Yesterday</h3>
              <p className="text-gray-300">{entry.workout_notes}</p>
            </div>
          )}
          
          {entry.workout_category && (
            <div>
              <h3 className="text-lg font-semibold text-white">Workout Category</h3>
              <p className="text-gray-300">{entry.workout_category}</p>
            </div>
          )}
          
          {entry.deep_flow_activity && (
            <div>
              <h3 className="text-lg font-semibold text-white">Deep Flow Activity</h3>
              <p className="text-gray-300">{entry.deep_flow_activity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gratitude, setGratitude] = useState('');
  const [gifts, setGifts] = useState('');
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);
  const [strategyChecks, setStrategyChecks] = useState<Record<string, boolean>>({});
  const [bestDay, setBestDay] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutCategory, setWorkoutCategory] = useState('');
  const [deepFlowActivity, setDeepFlowActivity] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            date,
            gratitude,
            gifts,
            strategy,
            strategy_checks: strategyChecks,
            best_day: bestDay,
            workout_notes: workoutNotes,
            workout_category: workoutCategory,
            deep_flow_activity: deepFlowActivity,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setGratitude('');
      setGifts('');
      setStrategy(DEFAULT_STRATEGY);
      setStrategyChecks({});
      setBestDay('');
      setWorkoutNotes('');
      setWorkoutCategory('');
      setDeepFlowActivity('');
      
      router.refresh();
    } catch (error) {
      console.error('Error inserting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setStrategyChecks(entry.strategy_checks || {});
  };

  const handleStrategyToggle = async (item: string, checked: boolean) => {
    const newChecks = { ...strategyChecks, [item]: checked };
    setStrategyChecks(newChecks);

    if (selectedEntry) {
      try {
        const { error } = await supabase
          .from('journal_entries')
          .update({ strategy_checks: newChecks })
          .eq('id', selectedEntry.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating strategy checks:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PreviousEntries onEntryClick={handleEntryClick} />
        {selectedEntry && (
          <EntryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What are you grateful for today?
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What are your gifts to share with the world?
            </label>
            <textarea
              value={gifts}
              onChange={(e) => setGifts(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="What unique talents, insights, or contributions can you offer to make the world better?"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Strategy
            </label>
            {selectedEntry ? (
              <StrategySection 
                strategy={selectedEntry.strategy} 
                checks={strategyChecks}
                onToggle={handleStrategyToggle}
              />
            ) : (
              <div>
                <StrategySection 
                  strategy={strategy} 
                  checks={strategyChecks}
                  onToggle={handleStrategyToggle}
                />
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="mt-4 w-full h-48 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Category
            </label>
            <div className="flex flex-wrap gap-2">
              {['Upper Strength', 'Lower Strength', 'Endurance'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setWorkoutCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    workoutCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Workout Notes from Yesterday
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              What is my Deep Flow Activity today?
            </label>
            <textarea
              value={deepFlowActivity}
              onChange={(e) => setDeepFlowActivity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="What activity will put you in a state of deep focus and flow?"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
