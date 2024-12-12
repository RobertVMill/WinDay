import React, { useState, useEffect, useMemo } from 'react';

interface Props {
  duration: number;
  onComplete: (focusTaps: number) => void;
  onCancel: () => void;
}

export default function MeditationTimer({ duration, onComplete, onCancel }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const bellSound = useMemo(() => new Audio('/sounds/bell_sound.mp3'), []);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [focusTaps, setFocusTaps] = useState(0);
  const [showTapFeedback, setShowTapFeedback] = useState(false);

  // Request wake lock when component mounts
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const wakeLock = await navigator.wakeLock.request('screen');
          setWakeLock(wakeLock);
          console.log('Wake Lock is active');
        }
      } catch (err) {
        console.error('Error requesting wake lock:', err);
      }
    };

    requestWakeLock();

    // Release wake lock when component unmounts
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [wakeLock]);

  // Re-request wake lock if page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        try {
          if ('wakeLock' in navigator) {
            const newWakeLock = await navigator.wakeLock.request('screen');
            setWakeLock(newWakeLock);
            console.log('Wake Lock is re-acquired');
          }
        } catch (err) {
          console.error('Error re-requesting wake lock:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (wakeLock) {
            wakeLock.release().catch(console.error);
          }
          bellSound.play().then(() => {
            setTimeout(() => onComplete(focusTaps), 2000);
          }).catch(err => {
            console.error('Error playing bell sound:', err);
            onComplete(focusTaps);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onComplete, bellSound, wakeLock, focusTaps]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const handleTapToFocus = () => {
    setFocusTaps(prev => prev + 1);
    setShowTapFeedback(true);
    setTimeout(() => setShowTapFeedback(false), 500);
  };

  const handleEndEarly = () => {
    if (wakeLock) {
      wakeLock.release().catch(console.error);
    }
    bellSound.play().catch(console.error);
    onCancel();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onClick={handleTapToFocus}
    >
      <div 
        className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 relative"
        onClick={e => e.stopPropagation()} // Prevent taps on the control panel from counting
      >
        <button
          onClick={handleEndEarly}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-medium">Meditation Timer</h2>
          
          {/* Timer Circle */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                className="text-blue-500 transition-all duration-200"
              />
            </svg>
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Focus Tap Counter */}
          <div className="text-sm text-gray-400">
            Refocus count: <span className="font-medium text-white">{focusTaps}</span>
          </div>

          {/* Tap Target Area */}
          <div className="relative">
            <div className="absolute -inset-4">
              <div className="w-full h-full bg-white/5 rounded-lg animate-pulse" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTapToFocus();
              }}
              className="relative w-full py-6 rounded-lg border-2 border-white/20 hover:border-white/30 transition-colors"
            >
              <div className="text-lg font-medium mb-1">Lost Focus?</div>
              <div className="text-sm text-gray-400">Tap here or anywhere to refocus</div>
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium min-w-[100px]"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleEndEarly}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-medium min-w-[100px]"
            >
              End
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            {isPaused ? 'Timer paused' : 'Tap anywhere when you notice your mind has wandered'}
          </p>
        </div>

        {/* Tap Feedback Animation */}
        {showTapFeedback && (
          <div className="fixed inset-0 bg-white/10 animate-fade-out pointer-events-none" />
        )}
      </div>
    </div>
  );
}
