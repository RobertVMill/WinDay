'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ScoreData {
  date: string;
  sleep_performance: number;
  fast_until_noon: boolean;
  minutes_read: number;
  github_commits: number;
  no_p: boolean;
  no_youtube: boolean;
  no_rap: boolean;
  nidra: boolean;
}

export default function ScoreCard() {
  const [formData, setFormData] = useState<ScoreData>({
    date: new Date().toISOString().split('T')[0],
    sleep_performance: 0,
    fast_until_noon: false,
    minutes_read: 0,
    github_commits: 0,
    no_p: false,
    no_youtube: false,
    no_rap: false,
    nidra: false
  });

  const [totalScore, setTotalScore] = useState(0);
  const [saving, setSaving] = useState(false);

  // Calculate total score whenever form data changes
  useEffect(() => {
    let score = 0;
    
    // Sleep performance (0-20 points based on percentage)
    score += Math.round((formData.sleep_performance / 100) * 20);
    
    // Boolean checks (10 points each)
    if (formData.fast_until_noon) score += 10;
    if (formData.no_p) score += 10;
    if (formData.no_youtube) score += 10;
    if (formData.no_rap) score += 10;
    if (formData.nidra) score += 10;
    
    // Reading minutes (1 point per 10 minutes, max 15 points)
    score += Math.min(Math.floor(formData.minutes_read / 10), 15);
    
    // GitHub commits (2 points per commit, max 15 points)
    score += Math.min(formData.github_commits * 2, 15);
    
    setTotalScore(score);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? Number(value) :
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('daily_scores')
        .insert([{ ...formData, total_score: totalScore }]);
        
      if (error) throw error;
      
      alert('Score saved successfully!');
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Error saving score. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Daily Score Card</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sleep_performance" className="block text-sm font-medium">
            Sleep Performance (0-100%)
          </label>
          <input
            type="number"
            id="sleep_performance"
            name="sleep_performance"
            min="0"
            max="100"
            value={formData.sleep_performance}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white/5"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="minutes_read" className="block text-sm font-medium">
              Minutes Read
            </label>
            <input
              type="number"
              id="minutes_read"
              name="minutes_read"
              min="0"
              value={formData.minutes_read}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="github_commits" className="block text-sm font-medium">
              GitHub Commits
            </label>
            <input
              type="number"
              id="github_commits"
              name="github_commits"
              min="0"
              value={formData.github_commits}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white/5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="fast_until_noon"
              name="fast_until_noon"
              checked={formData.fast_until_noon}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="fast_until_noon" className="ml-2 block text-sm">
              Fast until noon
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="no_p"
              name="no_p"
              checked={formData.no_p}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="no_p" className="ml-2 block text-sm">
              No P
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="no_youtube"
              name="no_youtube"
              checked={formData.no_youtube}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="no_youtube" className="ml-2 block text-sm">
              No YouTube
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="no_rap"
              name="no_rap"
              checked={formData.no_rap}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="no_rap" className="ml-2 block text-sm">
              No Rap
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="nidra"
              name="nidra"
              checked={formData.nidra}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="nidra" className="ml-2 block text-sm">
              Nidra
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-semibold text-center">
            Total Score: {totalScore}/100
          </p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Sleep Performance: 0-20 points</p>
            <p>• Each habit: 10 points</p>
            <p>• Reading: 1 point per 10 mins (max 15)</p>
            <p>• GitHub: 2 points per commit (max 15)</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {saving ? 'Saving...' : 'Save Score'}
        </button>
      </form>
    </main>
  );
}
