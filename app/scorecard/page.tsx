'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  journal_entry_id?: string;
  mood_score?: number;
  energy_score?: number;
  notes?: string;
}

const calculateTotalScore = (score: ScoreData) => {
  let total = 0;
  
  // Sleep performance (0-20 points based on percentage)
  total += Math.round((score.sleep_performance / 100) * 20);
  
  // Boolean checks (10 points each)
  if (score.fast_until_noon) total += 10;
  if (score.no_p) total += 10;
  if (score.no_youtube) total += 10;
  if (score.no_rap) total += 10;
  if (score.nidra) total += 10;
  
  // Reading minutes (1 point per 10 minutes, max 15 points)
  total += Math.min(Math.floor(score.minutes_read / 10), 15);
  
  // GitHub commits (2 points per commit, max 15 points)
  total += Math.min(score.github_commits * 2, 15);
  
  return total;
};

const ScoreChart = ({ scores }: { scores: ScoreData[] }) => {
  const data = {
    labels: scores.map(score => score.date),
    datasets: [
      {
        label: 'Total Score',
        data: scores.map(score => calculateTotalScore(score)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Score History',
      },
    },
  };

  return <Line data={data} options={options} />;
};

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
    nidra: false,
    mood_score: 0,
    energy_score: 0,
    notes: ''
  });

  const [totalScore, setTotalScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previousScores, setPreviousScores] = useState<ScoreData[]>([]);

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

  useEffect(() => {
    const fetchPreviousScores = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_scores')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        if (data) setPreviousScores(data);
      } catch (error) {
        console.error('Error fetching previous scores:', error);
      }
    };

    fetchPreviousScores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
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
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-white">Daily Score Card</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <ScoreChart scores={previousScores} />
          </div>
          
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Previous Entries</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
              {previousScores.map((score, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-650 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <span className="font-medium text-gray-200">{new Date(score.date).toLocaleDateString()}</span>
                    <span className="text-xl font-bold text-blue-400 mt-2 sm:mt-0">Score: {calculateTotalScore(score)}</span>
                  </div>
                  {score.notes && (
                    <div className="mt-2 text-gray-300">
                      <p className="font-medium text-white">Journal Entry:</p>
                      <p className="mt-1 text-gray-300">{score.notes}</p>
                    </div>
                  )}
                  {(score.mood_score !== undefined || score.energy_score !== undefined) && (
                    <div className="mt-2 flex flex-wrap gap-4">
                      {score.mood_score !== undefined && (
                        <div className="bg-gray-800 px-3 py-1.5 rounded-full">
                          <span className="font-medium text-gray-300">Mood: </span>
                          <span className="text-lg">{score.mood_score > 0 ? '😊' : score.mood_score < 0 ? '😔' : '😐'}</span>
                        </div>
                      )}
                      {score.energy_score !== undefined && (
                        <div className="bg-gray-800 px-3 py-1.5 rounded-full">
                          <span className="font-medium text-gray-300">Energy: </span>
                          <span className="text-lg">{score.energy_score > 0 ? '⚡' : score.energy_score < 0 ? '🔋' : '📊'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-gray-800 p-4 sm:p-6 rounded-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="sleep_performance" className="block text-sm font-medium text-gray-300 mb-1">
                Sleep Performance (0-100%)
              </label>
              <input
                type="number"
                id="sleep_performance"
                name="sleep_performance"
                value={formData.sleep_performance}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mood_score" className="block text-sm font-medium text-gray-300 mb-1">
                  Mood Score (-5 to 5)
                </label>
                <input
                  type="number"
                  id="mood_score"
                  name="mood_score"
                  min="-5"
                  max="5"
                  value={formData.mood_score}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="energy_score" className="block text-sm font-medium text-gray-300 mb-1">
                  Energy Score (-5 to 5)
                </label>
                <input
                  type="number"
                  id="energy_score"
                  name="energy_score"
                  min="-5"
                  max="5"
                  value={formData.energy_score}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-32 p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="fast_until_noon"
                name="fast_until_noon"
                checked={formData.fast_until_noon}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="fast_until_noon" className="ml-2 block text-sm text-gray-300">
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
              <label htmlFor="no_p" className="ml-2 block text-sm text-gray-300">
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
              <label htmlFor="no_youtube" className="ml-2 block text-sm text-gray-300">
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
              <label htmlFor="no_rap" className="ml-2 block text-sm text-gray-300">
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
              <label htmlFor="nidra" className="ml-2 block text-sm text-gray-300">
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
            {saving ? `Saving...` : `Save Score`}
          </button>
        </form>
      </div>
    </div>
  );
}
