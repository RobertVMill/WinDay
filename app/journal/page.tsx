'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import QuoteDisplay from '../components/QuoteDisplay';

interface JournalEntry {
  id: number;
  date: string;
  gratitude: string | null;
  gifts: string | null;
  best_day: string | null;
  deep_flow_activity: string | null;
  work_goals: string | null;
  workout_type?: 'upper_strength' | 'lower_strength' | 'endurance';
  workout_notes?: string;
}
export default function JournalPage() {
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    gratitude: '',
    gifts: '',
    best_day: '',
    deep_flow_activity: '',
    work_goals: '',
    workout_type: undefined,
    workout_notes: ''
  });
  const [scoreData, setScoreData] = useState({
    sleep_performance: 0,
    fast_until_noon: false,
    no_p: false,
    no_youtube: false,
    childs_pose: false,
    happiness_raygun: false,
    gut_nourishment: 1,
    give_10x: false,
    eat_slowly: false,
    no_alarm: false,
    one_coffee: false,
    welcoming_clothes: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
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
          no_p: scoreData.no_p,
          no_youtube: scoreData.no_youtube,
          childs_pose: scoreData.childs_pose,
          happiness_raygun: scoreData.happiness_raygun,
          gut_nourishment: scoreData.gut_nourishment,
          give_10x: scoreData.give_10x,
          eat_slowly: scoreData.eat_slowly,
          no_alarm: scoreData.no_alarm,
          one_coffee: scoreData.one_coffee,
          welcoming_clothes: scoreData.welcoming_clothes
        }]);

      if (dailyScoreError) throw dailyScoreError;

      setFormData({
        gratitude: '',
        gifts: '',
        best_day: '',
        deep_flow_activity: '',
        work_goals: '',
        workout_type: undefined,
        workout_notes: ''
      });

      setScoreData({
        sleep_performance: 0,
        fast_until_noon: false,
        no_p: false,
        no_youtube: false,
        childs_pose: false,
        happiness_raygun: false,
        gut_nourishment: 1,
        give_10x: false,
        eat_slowly: false,
        no_alarm: false,
        one_coffee: false,
        welcoming_clothes: false
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

  const handleEntryChange = (field: keyof JournalEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 sm:p-6 font-spaceGrotesk">
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Gratitude
                </label>
                <textarea
                  value={formData.gratitude || ''}
                  onChange={(e) => handleEntryChange('gratitude', e.target.value)}
                  className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What are you grateful for today?"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Gifts
                </label>
                <textarea
                  value={formData.gifts || ''}
                  onChange={(e) => handleEntryChange('gifts', e.target.value)}
                  className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What gifts did you receive or give today?"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Work Achievements
                </label>
                <textarea
                  value={formData.deep_flow_activity || ''}
                  onChange={(e) => handleEntryChange('deep_flow_activity', e.target.value)}
                  className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What did you achieve at work yesterday?"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Today&apos;s Work Goals
                </label>
                <textarea
                  value={formData.work_goals || ''}
                  onChange={(e) => handleEntryChange('work_goals', e.target.value)}
                  className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What do you want to accomplish at work today?"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Make Today Your Best Day
                </label>
                <textarea
                  value={formData.best_day || ''}
                  onChange={(e) => handleEntryChange('best_day', e.target.value)}
                  className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="What would make today your absolute best day?"
                />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Yesterday's Workout Achievement
                </label>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Workout Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'upper_strength', label: 'Upper Strength' },
                        { id: 'lower_strength', label: 'Lower Strength' },
                        { id: 'endurance', label: 'Endurance' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleEntryChange('workout_type', type.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            formData.workout_type === type.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.workout_type && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Performance Notes</label>
                      <textarea
                        value={formData.workout_notes || ''}
                        onChange={(e) => handleEntryChange('workout_notes', e.target.value)}
                        className="w-full h-32 bg-gray-700/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder={`How did your ${
                          formData.workout_type === 'upper_strength' ? 'upper body' :
                          formData.workout_type === 'lower_strength' ? 'lower body' :
                          'endurance'
                        } workout go?`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Daily Habits
                </label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm text-gray-400">Sleep Quality</label>
                      <span className="text-sm text-gray-400">{scoreData.sleep_performance}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreData.sleep_performance}
                      onChange={(e) => setScoreData(prev => ({ 
                        ...prev, 
                        sleep_performance: parseInt(e.target.value) 
                      }))}
                      className="mt-2 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">0%</span>
                      <span className="text-xs text-gray-500">100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm text-gray-400">Gut Nourishment</label>
                      <span className="text-sm text-gray-400">{scoreData.gut_nourishment}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={scoreData.gut_nourishment}
                      onChange={(e) => setScoreData(prev => ({ 
                        ...prev, 
                        gut_nourishment: parseInt(e.target.value) 
                      }))}
                      className="mt-2 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Average</span>
                      <span className="text-xs text-gray-500">World Class</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.fast_until_noon}
                          onChange={(e) => setScoreData(prev => ({ ...prev, fast_until_noon: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Fast until noon</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (this is excellent for your gut maintenance, and your focus)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.no_youtube}
                          onChange={(e) => setScoreData(prev => ({ ...prev, no_youtube: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">No YouTube</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (once you start youtube, you're done being able to focus for the day)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.childs_pose}
                          onChange={(e) => setScoreData(prev => ({ ...prev, childs_pose: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Child's Pose</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (10 deep breaths before bed)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.happiness_raygun}
                          onChange={(e) => setScoreData(prev => ({ ...prev, happiness_raygun: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Full Effort to Make Friends</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (find pain in being friendly, and do it every time to every stranger)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.give_10x}
                          onChange={(e) => setScoreData(prev => ({ ...prev, give_10x: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Give 10X</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (plan to give 10X to everyone, regardless of who they are)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.eat_slowly}
                          onChange={(e) => setScoreData(prev => ({ ...prev, eat_slowly: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Eat Slowly</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (do the work upfront to let your gut absorb the nourishment)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.no_alarm}
                          onChange={(e) => setScoreData(prev => ({ ...prev, no_alarm: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">No Alarm</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (sleep as long as you can)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.one_coffee}
                          onChange={(e) => setScoreData(prev => ({ ...prev, one_coffee: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">One Coffee</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (no more than one coffee a day)
                      </span>
                    </div>

                    <div className="flex flex-col bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={scoreData.welcoming_clothes}
                          onChange={(e) => setScoreData(prev => ({ ...prev, welcoming_clothes: e.target.checked }))}
                          className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700 transition-all"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-300">Welcoming Clothes</label>
                      </div>
                      <span className="ml-8 text-xs text-gray-400 italic mt-1">
                        (optimize for making friends - wear very welcoming clothes)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg transform transition-all duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-blue-500/20'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
