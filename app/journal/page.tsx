'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QuoteDisplay from '../components/QuoteDisplay';

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
  gratitude: string | null;
  gifts: string | null;
  strategy: string | null;
  strategy_checks: any;
  best_day: string | null;
  image_url: string | null;
  deep_flow_activity: string | null;
  created_at?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [_hasMore, _setHasMore] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastDragX = useRef(0);
  const [timelineZoom, setTimelineZoom] = useState(100);
  const [timelinePan, setTimelinePan] = useState(0);

  const fetchEntries = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        // Filter out entries with null dates
        const validEntries = data.filter(entry => entry.date !== null) as JournalEntry[];
        setEntries(validEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Generate month/year markers
  const months = useMemo(() => {
    if (entries.length === 0) return [];

    // Add null checks for dates
    const firstEntry = entries[0].date;
    const lastEntry = entries[entries.length - 1].date;
    
    if (!firstEntry || !lastEntry) return [];

    const firstDate = new Date(firstEntry);
    const lastDate = new Date(lastEntry);
    const timeRange = lastDate.getTime() - firstDate.getTime();
    const markers: { date: Date; position: number }[] = [];

    let currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      const position = 15 + ((currentDate.getTime() - firstDate.getTime()) / timeRange) * 80;
      markers.push({
        date: new Date(currentDate),
        position
      });
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }

    return markers;
  }, [entries]);

  return (
    <div className="mt-12 font-spaceGrotesk">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Journey Timeline</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTimelineZoom(prev => Math.max(50, prev - 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm text-gray-400">{timelineZoom}%</span>
          <button
            onClick={() => setTimelineZoom(prev => Math.min(200, prev + 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-8">
        <div className="overflow-x-auto">
          <div
            ref={timelineRef}
            className="relative cursor-grab active:cursor-grabbing"
            style={{ 
              minWidth: '800px', 
              width: `${timelineZoom}%`,
              height: '250px',
              transform: `translateX(${timelinePan}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
            }}
            onWheel={(e: React.WheelEvent) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY * -0.5;
                setTimelineZoom(prev => Math.min(Math.max(50, prev + delta), 200));
              }
            }}
            onMouseDown={(e: React.MouseEvent) => {
              isDragging.current = true;
              lastDragX.current = e.clientX;
            }}
            onMouseMove={(e: React.MouseEvent) => {
              if (isDragging.current) {
                const delta = e.clientX - lastDragX.current;
                setTimelinePan(prev => prev + delta);
                lastDragX.current = e.clientX;
              }
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
            }}
          >
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-700"></div>

            {/* Today marker */}
            {entries.length > 0 && (
              <div 
                className="absolute top-0 bottom-0" 
                style={{ 
                  left: `${15 + ((new Date().getTime() - new Date(entries[0].date).getTime()) / 
                    (new Date(entries[entries.length - 1].date).getTime() - new Date(entries[0].date).getTime())) * 80}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="absolute top-6 w-0.5 h-full bg-red-500 opacity-20"></div>
                <div className="absolute top-4 -translate-x-1/2">
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Today
                  </div>
                </div>
                <div className="absolute top-8 -translate-x-1/2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0"></div>
                </div>
              </div>
            )}

            {/* Month/Year markers */}
            <div className="absolute bottom-0 left-0 right-0 h-8">
              {months.map((month, index) => (
                <div
                  key={month.date.toISOString()}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${month.position}%` }}
                >
                  <div className="h-3 w-px bg-gray-600"></div>
                  <div className="mt-1 text-xs text-gray-400 whitespace-nowrap">
                    {month.date.toLocaleDateString('en-US', { 
                      month: 'short',
                      year: month.date.getMonth() === 0 || index === 0 ? 'numeric' : undefined 
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Journal entries */}
            <div className="relative">
              {entries.map((entry, index) => {
                const position = entries.length <= 1 ? 50 : 
                  15 + ((new Date(entry.date).getTime() - new Date(entries[0].date).getTime()) / 
                    (new Date(entries[entries.length - 1].date).getTime() - new Date(entries[0].date).getTime())) * 80;

                return (
                  <div
                    key={entry.id}
                    className="absolute transform -translate-x-1/2"
                    style={{ 
                      left: `${position}%`,
                      top: index % 2 === 0 ? '20px' : '100px'
                    }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mb-2 mx-auto"></div>
                    <div
                      onClick={() => onEntryClick(entry)}
                      className="w-48 bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      <p className="text-white/90 text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{entry.gratitude}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
            <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
            <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function _EntryDetail({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{new Date(entry.date).toLocaleDateString()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {entry.image_url && (
            <div className="relative w-full h-48">
              <Image
                src={entry.image_url}
                alt="Journal entry image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Gratitude</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{entry.gratitude}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Gifts</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{entry.gifts}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Best Day Vision</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{entry.best_day}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Strategy</h3>
            <StrategySection 
              strategy={entry.strategy || DEFAULT_STRATEGY} 
              checks={entry.strategy_checks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    gratitude: '',
    gifts: '',
    strategy: DEFAULT_STRATEGY,
    strategy_checks: {},
    best_day: '',
    deep_flow_activity: ''
  });
  const [scoreData, setScoreData] = useState({
    sleep_performance: 0,
    fast_until_noon: false,
    minutes_read: 0,
    github_commits: 0,
    no_p: false,
    no_youtube: false,
    no_rap: false,
    nidra: false,
    mood_score: 0,
    energy_score: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [_selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // Save to journal entries
      const { error } = await supabase
        .from('journal_entries')
        .insert([{ ...formData, date: new Date().toISOString() }]);

      if (error) throw error;

      // Save to daily_scores
      const { error: dailyScoreError } = await supabase
        .from('daily_scores')
        .insert([{
          date: new Date().toISOString(),
          sleep_performance: scoreData.sleep_performance,
          fast_until_noon: scoreData.fast_until_noon,
          minutes_read: scoreData.minutes_read,
          github_commits: scoreData.github_commits,
          no_p: scoreData.no_p,
          no_youtube: scoreData.no_youtube,
          no_rap: scoreData.no_rap,
          nidra: scoreData.nidra,
          total_score: 0 // Calculate this based on your scoring logic
        }]);

      if (dailyScoreError) throw dailyScoreError;

      setFormData({
        gratitude: '',
        gifts: '',
        strategy: DEFAULT_STRATEGY,
        strategy_checks: {},
        best_day: '',
        deep_flow_activity: ''
      });

      setScoreData({
        sleep_performance: 0,
        fast_until_noon: false,
        minutes_read: 0,
        github_commits: 0,
        no_p: false,
        no_youtube: false,
        no_rap: false,
        nidra: false,
        mood_score: 0,
        energy_score: 0
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStrategyCheck = (item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      strategy_checks: {
        ...prev.strategy_checks,
        [item]: checked,
      },
    }));
  };

  const handleEntryChange = (field: keyof JournalEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-spaceGrotesk">
      <QuoteDisplay variant="banner" autoRefresh={true} refreshInterval={300000} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Journal</h1>
          <p className="text-gray-300 mt-2">Record your journey, celebrate your wins, and stay aligned with your goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {showSuccess && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
              Journal entry saved successfully!
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Gratitude
                </label>
                <textarea
                  value={formData.gratitude || ''}
                  onChange={(e) => handleEntryChange('gratitude', e.target.value)}
                  className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What are you grateful for today?"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Gifts
                </label>
                <textarea
                  value={formData.gifts || ''}
                  onChange={(e) => handleEntryChange('gifts', e.target.value)}
                  className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What gifts did you receive or give today?"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deep Flow Activity
                </label>
                <textarea
                  value={formData.deep_flow_activity || ''}
                  onChange={(e) => handleEntryChange('deep_flow_activity', e.target.value)}
                  className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What activity got you into deep flow today?"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Make Today Your Best Day
                </label>
                <textarea
                  value={formData.best_day || ''}
                  onChange={(e) => handleEntryChange('best_day', e.target.value)}
                  className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What would make today your absolute best day?"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Strategy Checklist
                </label>
                <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                  <StrategySection 
                    strategy={formData.strategy || DEFAULT_STRATEGY}
                    checks={formData.strategy_checks}
                    onToggle={handleStrategyCheck}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Daily Scores
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400">Sleep Performance (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreData.sleep_performance}
                    onChange={(e) => setScoreData(prev => ({ ...prev, sleep_performance: parseInt(e.target.value) || 0 }))}
                    className="mt-1 w-full p-2 bg-gray-700 rounded"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scoreData.fast_until_noon}
                      onChange={(e) => setScoreData(prev => ({ ...prev, fast_until_noon: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">Fast until noon</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scoreData.no_p}
                      onChange={(e) => setScoreData(prev => ({ ...prev, no_p: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">No P</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scoreData.no_youtube}
                      onChange={(e) => setScoreData(prev => ({ ...prev, no_youtube: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">No YouTube</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scoreData.no_rap}
                      onChange={(e) => setScoreData(prev => ({ ...prev, no_rap: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">No Rap</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scoreData.nidra}
                      onChange={(e) => setScoreData(prev => ({ ...prev, nidra: e.target.checked }))}
                      className="h-4 w-4 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">Nidra</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400">Minutes Read</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreData.minutes_read}
                    onChange={(e) => setScoreData(prev => ({ ...prev, minutes_read: parseInt(e.target.value) || 0 }))}
                    className="mt-1 w-full p-2 bg-gray-700 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400">GitHub Commits</label>
                  <input
                    type="number"
                    min="0"
                    value={scoreData.github_commits}
                    onChange={(e) => setScoreData(prev => ({ ...prev, github_commits: parseInt(e.target.value) || 0 }))}
                    className="mt-1 w-full p-2 bg-gray-700 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400">Mood Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreData.mood_score}
                    onChange={(e) => setScoreData(prev => ({ ...prev, mood_score: parseInt(e.target.value) || 0 }))}
                    className="mt-1 w-full p-2 bg-gray-700 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400">Energy Score (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scoreData.energy_score}
                    onChange={(e) => setScoreData(prev => ({ ...prev, energy_score: parseInt(e.target.value) || 0 }))}
                    className="mt-1 w-full p-2 bg-gray-700 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transform transition-all duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>

        <PreviousEntries onEntryClick={setSelectedEntry} />
      </div>
    </div>
  );
}
