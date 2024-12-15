'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import MeditationTimer from './MeditationTimer';
import Image from 'next/image';
import Link from 'next/link';

export interface ScheduleBlock {
  id: number;
  day_of_week: number;
  phase: string;
  activity: string;
  completed: boolean;
  notes?: string;
  day_type: string;
  instruction?: string;
}

interface Props {
  scheduleBlocks: ScheduleBlock[];
  onBlocksUpdate?: (blocks: ScheduleBlock[]) => void;
  singleDayMode?: boolean;
  showInstructions?: boolean;
}

interface JournalEntry {
  gratitude: string;
  gift: string;
  image?: string;  // Base64 encoded image
  morningYoga: boolean;
  tenX: boolean;
  oneCoffee: boolean;
  noYoutube: boolean;
  eveningYoga: boolean;
  wishStrangersWell: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PHASES = [
  'first_thing',    // Meditation
  'journal',        // Journal
  'early_morning',  // Workout
  'morning',        // Deep Work/Fireside
  'lunch',          // Lunch break
  'afternoon',      // Afternoon work
  'evening',        // Evening work
  'night',          // Entertainment
  'sleep'           // Sleep
] as const;

const PHASE_DESCRIPTIONS = {
  first_thing: 'Meditation',
  journal: 'Journal',
  early_morning: 'Workout',
  morning: 'Deep Work',
  lunch: 'Lunch break',
  afternoon: 'Afternoon work',
  evening: 'Evening work',
  night: 'Entertainment',
  sleep: 'Sleep'
};

const PHASE_LOVE_NOTES = {
  first_thing: "I love the process of getting higher through belly breath and third eye attention",
  journal: "I love the process of clarifying my intentions, and aligning my energy",
  early_morning: "I love the process of finding pain and attacking pain, finding pain and attacking pain",
  morning: (dayOfWeek: number) => 
    dayOfWeek === 0 
      ? "I love getting so granular in the work that the dopamine gets me high and I forget where I am"
      : "I love getting so granular in the work that the dopamine gets me high and I forget where I am",
  lunch: "I love nourishing my gut with the softest, most nutrient rich foods",
  afternoon: (dayOfWeek: number) =>
    dayOfWeek === 0
      ? "I love getting so granular in the work that the dopamine gets me high and I forget where I am"
      : "I love getting so granular in the work that the dopamine gets me high and I forget where I am",
  evening: "I love seeing the incredible creativity that can come in tandem with my mind and AI",
  night: "Time to wind down and reflect",
  sleep: "Rest and recharge for tomorrow's journey"
};

const scheduleTemplates: { [key: string]: any } = {
  standard_work: {
    first_thing: 'Meditation',
    early_morning: 'Exercise',
    morning: 'Deep Work',
    mid_morning: 'Meetings/Calls',
    lunch: 'Lunch Break',
    afternoon: 'Project Work',
    evening: 'Review & Plan',
    night: 'Reading',
    journal: 'Reflection',
    sleep: 'Sleep'
  },
  weekend: {
    first_thing: 'Gentle Meditation',
    early_morning: 'Long Morning Walk',
    morning: 'Relaxed Breakfast',
    mid_morning: 'Free Time',
    lunch: 'Weekend Lunch',
    afternoon: 'Long Afternoon Walk',
    evening: 'Social Time',
    night: 'Entertainment',
    journal: 'Weekend Reflection',
    sleep: 'Sleep'
  },
  deep_work: {
    first_thing: 'Meditation',
    early_morning: 'Light Exercise',
    morning: 'Deep Focus Session',
    mid_morning: 'Creative Work',
    lunch: 'Mindful Lunch',
    afternoon: 'Deep Focus Session',
    evening: 'Learning Time',
    night: 'Wind Down',
    journal: 'Progress Notes',
    sleep: 'Sleep'
  },
  rest: {
    first_thing: 'Gentle Meditation',
    early_morning: 'Stretching',
    morning: 'Free Time',
    mid_morning: 'Hobby Time',
    lunch: 'Relaxed Lunch',
    afternoon: 'Nature Time',
    evening: 'Entertainment',
    night: 'Relaxation',
    journal: 'Gratitude',
    sleep: 'Sleep'
  },
  random: {
    first_thing: 'Dance Meditation',
    early_morning: 'Beach Run',
    morning: 'Learn Magic Tricks',
    mid_morning: 'Create Digital Art',
    lunch: 'Food Truck Adventure',
    afternoon: 'Museum Visit',
    evening: 'Board Game Night',
    night: 'Stargazing',
    journal: 'Adventure Planning',
    sleep: 'Sleep'
  }
};

const _mindsetsByPhase: { [key: string]: string } = {
  first_thing: "One deep breath at a time, release thought and achieve complete stillness and serotonin.",
  early_morning: "Find damage early, let the natural painkillers carry you.",
  morning: "Love the process of losing yourself in your work, losing track of time, forgetting where you are concentrating the value of your product, and watching the money grow",
  mid_morning: "Love the process of losing yourself in your work, losing track of time, forgetting where you are concentrating the value of your product, and watching the money grow",
  lunch: "Practice mindful eating. Nourish your body and mind.",
  afternoon: "Love the process of losing yourself in your work, losing track of time, forgetting where you are concentrating the value of your product, and watching the money grow",
  evening: "Love the process of losing yourself in your work, losing track of time, forgetting where you are concentrating the value of your product, and watching the money grow",
  night: "Embrace curiosity. Knowledge is an endless journey.",
  journal: "Be honest and vulnerable. Your experiences shape your growth.",
  sleep: "Rest and recharge for the next day's journey."
};

const generateDefaultBlocks = (date: Date): ScheduleBlock[] => {
  const dayOfWeek = date.getDay();
  const defaultBlocks: ScheduleBlock[] = [];
  let id = 1;

  // Generate blocks for each phase
  PHASES.forEach(phase => {
    defaultBlocks.push({
      id: id++,
      day_of_week: dayOfWeek,
      phase,
      activity: typeof PHASE_DESCRIPTIONS[phase] === 'string' ? PHASE_DESCRIPTIONS[phase] : '',
      completed: false,
      notes: '',
      day_type: 'standard_work'
    });
  });

  return defaultBlocks;
};

const WeeklySchedule: React.FC<Props> = ({
  scheduleBlocks: initialBlocks,
  onBlocksUpdate,
  singleDayMode,
  showInstructions
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const getInitialBlocks = useCallback(() => {
    if (typeof window === 'undefined') return initialBlocks;
    
    const savedBlocks = localStorage.getItem('schedule_blocks');
    if (savedBlocks) {
      return JSON.parse(savedBlocks);
    }
    return initialBlocks.length > 0 ? initialBlocks : generateDefaultBlocks(today);
  }, [today, initialBlocks]);

  const [blocks, setBlocks] = useState<ScheduleBlock[]>(initialBlocks);
  
  useEffect(() => {
    const loadedBlocks = getInitialBlocks();
    setBlocks(loadedBlocks);
  }, [getInitialBlocks]);

  const saveBlocks = useCallback((newBlocks: ScheduleBlock[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schedule_blocks', JSON.stringify(newBlocks));
    }
    setBlocks(newBlocks);
  }, []);

  const updateSleepScore = useCallback((blockId: number, score: string) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId
        ? { ...block, notes: score }
        : block
    );
    saveBlocks(newBlocks);
  }, [blocks, saveBlocks]);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  const [editingBlock, setEditingBlock] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [journalingBlock, setJournalingBlock] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    gratitude: '',
    gift: '',
    image: undefined,
    morningYoga: false,
    tenX: false,
    oneCoffee: false,
    noYoutube: false,
    eveningYoga: false,
    wishStrangersWell: false,
  });
  const [_meditationBlock, setMeditationBlock] = useState<number | null>(null);
  const [activeTimer, setActiveTimer] = useState<{ blockId: number; duration: number } | null>(null);

  const getActivityStyle = (activity: string) => {
    switch (activity.toLowerCase()) {
      case 'meditation':
        return 'bg-purple-500/20 border-l-4 border-purple-500 text-purple-100';
      case 'journal':
        return 'bg-indigo-500/20 border-l-4 border-indigo-500 text-indigo-100';
      case 'workout':
        return 'bg-red-500/20 border-l-4 border-red-500 text-red-100';
      case 'writing':
        return 'bg-blue-500/20 border-l-4 border-blue-500 text-blue-100';
      case 'deep work':
        return 'bg-green-500/20 border-l-4 border-green-500 text-green-100';
      case 'meal':
        return 'bg-yellow-500/20 border-l-4 border-yellow-500 text-yellow-100';
      case 'coding':
        return 'bg-pink-500/20 border-l-4 border-pink-500 text-pink-100';
      case 'entertainment':
        return 'bg-orange-500/20 border-l-4 border-orange-500 text-orange-100';
      case 'sleep':
        return 'bg-blue-500/20 border-l-4 border-blue-500 text-blue-100';
      case 'fireside':
        return 'bg-amber-500/20 border-l-4 border-amber-500 text-amber-100';
      default:
        return 'bg-gray-500/20 border-l-4 border-gray-500 text-gray-100';
    }
  };

  const _formatPhase = (phase: string) => {
    return phase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getBlocksForPhase = (dayOfWeek: number, phase: string) => {
    return blocks.filter(
      block => block.day_of_week === dayOfWeek && block.phase === phase
    );
  };

  const _currentWeekDates = useMemo(() => [...Array(7)].map((_, i) => 
    addDays(currentWeekStart, i)
  ), [currentWeekStart]);

  const previousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const _startMeditation = useCallback((block: ScheduleBlock) => {
    setActiveTimer({ blockId: block.id, duration: 20 }); // Default 20 minutes
  }, []);

  const handleMeditationComplete = useCallback(async (focusTaps: number) => {
    if (activeTimer) {
      try {
        const updatedBlocks = blocks.map(block => 
          block.id === activeTimer.blockId
            ? { ...block, completed: true, focus_taps: focusTaps }
            : block
        );
        onBlocksUpdate?.(updatedBlocks);
        setActiveTimer(null);
      } catch (error) {
        console.error('Error completing meditation:', error);
      }
    }
  }, [activeTimer, blocks, onBlocksUpdate]);

  const handleMeditationCancel = useCallback(() => {
    setActiveTimer(null);
  }, []);

  const toggleCompleted = async (blockId: number, completed: boolean) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, completed } : block
    );
    onBlocksUpdate?.(updatedBlocks);
  };

  const updateNotes = async (blockId: number, notes: string) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, notes } : block
    );
    onBlocksUpdate?.(updatedBlocks);
  };

  const handleDayTypeChange = async (dayType: string, dayIndex: number) => {
    // Determine if it's a weekend day
    const isWeekendDay = isWeekend(dayIndex);
    
    // If switching to standard_work, use weekend template for weekend days
    const effectiveDayType = dayType === 'standard_work' 
      ? (isWeekendDay ? 'weekend' : 'standard_work')
      : dayType;
    
    const template = scheduleTemplates[effectiveDayType];
    
    // Create new blocks based on the template
    const newBlocks = Object.entries(template).map(([phase, activity]) => ({
      id: Math.random(),
      day_of_week: dayIndex,
      day_type: effectiveDayType,
      phase,
      activity: typeof activity === 'string' ? activity : '',
      completed: false,
      notes: '',
      focus_taps: undefined
    }));

    // Update local state
    const updatedBlocks = [
      ...blocks.filter(block => block.day_of_week !== dayIndex),
      ...newBlocks
    ];
    onBlocksUpdate?.(updatedBlocks);
  };

  const isWeekend = (dayIndex: number) => {
    return dayIndex === 6 || dayIndex === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setJournalEntry(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="space-y-4">
      {activeTimer && (
        <MeditationTimer
          duration={activeTimer.duration}
          onComplete={handleMeditationComplete}
          onCancel={handleMeditationCancel}
        />
      )}

      {!singleDayMode && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-lg font-medium">
              {format(currentWeekStart, 'MMMM d')} -{' '}
              {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
            </div>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            →
          </button>
        </div>
      )}

      <div className={`grid ${singleDayMode ? 'grid-cols-[auto,1fr]' : 'grid-cols-[auto,repeat(7,1fr)]'} gap-4`}>
        <div className="font-medium">Phase</div>
        {singleDayMode ? (
          <div className="text-center">
            <div className="font-medium">{DAYS[new Date().getDay()]}</div>
            <div className="text-sm text-gray-400">{format(new Date(), 'M/d')}</div>
          </div>
        ) : (
          DAYS.map((day, index) => {
            const date = addDays(currentWeekStart, index);
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            const isPast = date < today;
            const dayType = blocks.find(b => b.day_of_week === index)?.day_type || 'standard_work';
            return (
              <div key={day} className={`text-center space-y-1 ${isPast ? 'opacity-50' : ''} ${isToday ? 'ring-2 ring-blue-500 rounded-lg p-1' : ''}`}>
                <div className="font-medium">{day}</div>
                <div className="text-sm text-gray-400">{format(date, 'M/d')}</div>
                <select
                  value={dayType}
                  onChange={(e) => handleDayTypeChange(e.target.value, index)}
                  className="text-xs bg-gray-800 border border-gray-700 rounded px-1 py-0.5 w-full"
                >
                  <option value="standard_work">Standard Work</option>
                  <option value="deep_work">Deep Work</option>
                  <option value="standard_vacation">Vacation</option>
                  <option value="random">Random</option>
                  <option value="rest">Rest</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>
            );
          })
        )}

        {PHASES.map((phase) => (
          <React.Fragment key={phase}>
            <div className="font-medium group relative">
              {phase}
              {showInstructions && (
                <div className="hidden group-hover:block absolute left-0 top-full mt-2 p-3 bg-gray-800 rounded-lg shadow-xl z-10 w-64">
                  <p className="text-sm text-gray-300 italic">
                    {typeof PHASE_LOVE_NOTES[phase] === 'function' ? PHASE_LOVE_NOTES[phase](0) : PHASE_LOVE_NOTES[phase]}
                  </p>
                </div>
              )}
            </div>
            {singleDayMode ? (
              <div className="border border-gray-800 rounded p-2">
                <div className="text-xs text-gray-400 italic mb-2 px-2">
                  {typeof PHASE_LOVE_NOTES[phase] === 'function' ? PHASE_LOVE_NOTES[phase](0) : PHASE_LOVE_NOTES[phase]}
                </div>
                {getBlocksForPhase(new Date().getDay(), phase).map((block) => (
                  <div
                    key={block.id}
                    className={`mb-2 last:mb-0 p-2 rounded-lg transition-all duration-200 ${
                      getActivityStyle(block.activity)
                    } ${block.completed ? 'opacity-50' : ''} hover:opacity-90`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={block.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (block.phase === 'journal') {
                            setJournalingBlock(block.id);
                            setJournalEntry({
                              gratitude: '',
                              gift: '',
                              image: undefined,
                              morningYoga: false,
                              tenX: false,
                              oneCoffee: false,
                              noYoutube: false,
                              eveningYoga: false,
                              wishStrangersWell: false
                            });
                          } else if (block.phase === 'first_thing') {
                            setMeditationBlock(block.id);
                          } else if (block.phase !== 'lunch') {
                            toggleCompleted(block.id, !block.completed);
                          }
                        }}
                        className="appearance-none w-5 h-5 rounded border-2 border-white/30 bg-transparent checked:bg-blue-500 checked:border-blue-500 hover:border-white/50 cursor-pointer relative
                          after:content-[''] after:w-2.5 after:h-1.5 after:border-white after:border-b-2 after:border-r-2 after:absolute after:rotate-45 after:left-[6px] after:top-[4px] after:opacity-0 checked:after:opacity-100
                          transition-all duration-100 ease-in-out"
                      />
                      <div className="font-medium">{block.activity}</div>
                    </div>

                    {block.notes && block.phase !== 'sleep' && (
                      <div className="text-xs mt-1 opacity-80">
                        {block.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              [...Array(7)].map((_, dayIndex) => {
                const blocks = getBlocksForPhase(dayIndex, phase);
                return (
                  <div
                    key={dayIndex}
                    className={`border border-gray-800 rounded p-2`}
                  >
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className={`mb-2 last:mb-0 p-2 rounded-lg transition-all duration-200 ${
                          getActivityStyle(block.activity)
                        } ${block.completed ? 'opacity-50' : ''} hover:opacity-90`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={block.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (block.phase === 'journal') {
                                setJournalingBlock(block.id);
                                setJournalEntry({
                                  gratitude: '',
                                  gift: '',
                                  image: undefined,
                                  morningYoga: false,
                                  tenX: false,
                                  oneCoffee: false,
                                  noYoutube: false,
                                  eveningYoga: false,
                                  wishStrangersWell: false
                                });
                              } else if (block.phase === 'first_thing') {
                                setMeditationBlock(block.id);
                              } else if (block.phase !== 'lunch') {
                                toggleCompleted(block.id, !block.completed);
                              }
                            }}
                            className="appearance-none w-5 h-5 rounded border-2 border-white/30 bg-transparent checked:bg-blue-500 checked:border-blue-500 hover:border-white/50 cursor-pointer relative
                              after:content-[''] after:w-2.5 after:h-1.5 after:border-white after:border-b-2 after:border-r-2 after:absolute after:rotate-45 after:left-[6px] after:top-[4px] after:opacity-0 checked:after:opacity-100
                              transition-all duration-100 ease-in-out"
                          />
                          <div className="font-medium">{block.activity}</div>
                        </div>

                        {block.notes && block.phase !== 'sleep' && (
                          <div className="text-xs mt-1 opacity-80">
                            {block.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </React.Fragment>
        ))}
      </div>

      {journalingBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Journal Entry</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">What are you grateful for?</label>
                <textarea
                  value={journalEntry.gratitude}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, gratitude: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">What gift are you giving to the world today?</label>
                <textarea
                  value={journalEntry.gift}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, gift: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium mb-2">Daily Habits</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.morningYoga}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, morningYoga: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>2 Minute Morning Yoga</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.tenX}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, tenX: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Give 10X to People</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.oneCoffee}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, oneCoffee: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Only One Coffee</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.noYoutube}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, noYoutube: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Avoid YouTube</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.eveningYoga}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, eveningYoga: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>2 Minute Evening Yoga</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={journalEntry.wishStrangersWell}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, wishStrangersWell: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Wish Strangers Well</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Today's Selfie</label>
                <div className="flex items-center gap-4">
                  {journalEntry.image && (
                    <Image
                      src={journalEntry.image}
                      alt="Journal selfie"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded cursor-pointer">
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setJournalingBlock(null);
                  setJournalEntry({
                    gratitude: '',
                    gift: '',
                    image: undefined,
                    morningYoga: false,
                    tenX: false,
                    oneCoffee: false,
                    noYoutube: false,
                    eveningYoga: false,
                    wishStrangersWell: false
                  });
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleCompleted(journalingBlock, true);
                  setJournalingBlock(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBlock !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              {blocks.find(b => b.id === editingBlock)?.phase === 'sleep' ? 'Enter Sleep Score' : 'Add Note'}
            </h3>
            <input
              type={blocks.find(b => b.id === editingBlock)?.phase === 'sleep' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => {
                if (blocks.find(b => b.id === editingBlock)?.phase === 'sleep') {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setEditValue(e.target.value);
                  }
                } else {
                  setEditValue(e.target.value);
                }
              }}
              min={blocks.find(b => b.id === editingBlock)?.phase === 'sleep' ? 0 : undefined}
              max={blocks.find(b => b.id === editingBlock)?.phase === 'sleep' ? 100 : undefined}
              placeholder={blocks.find(b => b.id === editingBlock)?.phase === 'sleep' ? 'Enter sleep score (0-100)' : 'Enter note'}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:outline-none mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const block = blocks.find(b => b.id === editingBlock);
                  if (block?.phase === 'sleep') {
                    updateSleepScore(editingBlock, editValue);
                  } else {
                    updateNotes(editingBlock, editValue);
                  }
                  setEditingBlock(null);
                }}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <Link 
          href="/journal"
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity"></span>
          <span className="absolute bottom-0 w-0 h-1 bg-white transition-all duration-200 ease-out group-hover:w-full"></span>
          <span className="relative flex items-center">
            Next: Journal
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform duration-200 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default WeeklySchedule;
