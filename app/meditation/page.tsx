'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import QuoteDisplay from '../components/QuoteDisplay';

interface MeditationSession {
  duration_minutes: number;
  interval_minutes: number | null;
  distraction_count: number;
}

export default function MeditationPage() {
  const [duration, setDuration] = useState(20); // Default 20 minutes
  const [intervalTime, setIntervalTime] = useState<number | null>(5); // Default 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>();
  const bellAudioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    // Load audio file
    const audio = new Audio('/sounds/bell_sound.mp3');
    audio.preload = 'auto';
    audio.load();
    bellAudioRef.current = audio;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const playBell = () => {
    if (bellAudioRef.current) {
      // Clone the audio element for overlapping sounds
      const bellSound = bellAudioRef.current.cloneNode() as HTMLAudioElement;
      bellSound.play();
    }
  };

  const startMeditation = () => {
    setIsRunning(true);
    setTimeLeft(duration * 60);
    setDistractionCount(0);
    setShowSummary(false);
    startTimeRef.current = new Date();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Play bell at intervals
        if (intervalTime && prev > 0 && prev % (intervalTime * 60) === 0) {
          playBell();
        }
        
        // End meditation when time is up
        if (prev <= 1) {
          endMeditation();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const endMeditation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
    playBell();
    setShowSummary(true);

    // Save session to database
    try {
      const { error } = await supabase
        .from('meditation_sessions')
        .insert([{
          date: startTimeRef.current?.toISOString(),
          duration_minutes: duration,
          interval_minutes: intervalTime,
          distraction_count: distractionCount
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving meditation session:', error);
    }
  };

  const trackDistraction = () => {
    if (isRunning) {
      setDistractionCount(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-spaceGrotesk">
      <QuoteDisplay variant="banner" autoRefresh={true} refreshInterval={300000} />
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Meditation Timer</h1>
          <p className="text-gray-300 mt-2">Stay present and track your focus</p>
        </div>

        {!isRunning && !showSummary && (
          <div className="space-y-6 bg-gray-800 rounded-lg p-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interval Bell (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={intervalTime || ''}
                onChange={(e) => setIntervalTime(e.target.value ? Math.max(1, parseInt(e.target.value)) : null)}
                className="w-full p-2 bg-gray-700 rounded text-white"
                placeholder="Leave empty for no interval"
              />
            </div>

            <button
              onClick={() => playBell()}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors mb-2"
            >
              Test Bell Sound
            </button>

            <button
              onClick={startMeditation}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Start Meditation
            </button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-8 text-center">
            <div className="text-6xl font-bold font-mono">{formatTime(timeLeft)}</div>
            
            <button
              onClick={trackDistraction}
              className="w-full py-12 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-xl font-medium transition-colors"
            >
              Track Distraction ({distractionCount})
            </button>

            <button
              onClick={endMeditation}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              End Session
            </button>
          </div>
        )}

        {showSummary && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">Session Summary</h2>
            <div className="space-y-2">
              <p>Duration: {duration} minutes</p>
              {intervalTime && <p>Interval Bell: Every {intervalTime} minutes</p>}
              <p>Distractions: {distractionCount}</p>
              <p className="text-gray-400">Focus Score: {Math.max(0, 100 - (distractionCount * 5))}%</p>
            </div>

            <button
              onClick={() => {
                setShowSummary(false);
                setTimeLeft(0);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors mt-4"
            >
              Start New Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
