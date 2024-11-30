'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            WinDay
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your personal command center for building an extraordinary life, one day at a time.
          </p>
        </section>

        {/* Vision Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Vision</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Mission</h3>
              <p className="text-gray-400">
                To create a life of deep work, physical excellence, and continuous growth
                through deliberate practice and daily optimization.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Core Values</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Deep, focused work</li>
                <li>• Physical and mental excellence</li>
                <li>• Continuous learning and growth</li>
                <li>• Mindful living</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Tools for Excellence</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Journal</h3>
              <p className="text-gray-400">
                Daily reflection on gratitude, gifts, and strategy for continuous improvement.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Perfect Day</h3>
              <p className="text-gray-400">
                Templates for different types of perfect days, from deep work to creative flow.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Workouts</h3>
              <p className="text-gray-400">
                Track and reflect on physical training across different categories.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Goals</h3>
              <p className="text-gray-400">
                Set and track meaningful goals aligned with your vision.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Quotes</h3>
              <p className="text-gray-400">
                Curated wisdom to inspire and guide your journey.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gray-200/20">
              <h3 className="text-xl font-semibold mb-3">Scorecard</h3>
              <p className="text-gray-400">
                Measure what matters and track your progress over time.
              </p>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="text-center space-y-4 py-8">
          <blockquote className="text-2xl italic text-gray-300">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </blockquote>
          <p className="text-gray-400">- Aristotle</p>
        </section>
      </div>
    </main>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">WinDay</h1>
          <p className="text-xl text-gray-300 mb-8">Track your journey to greatness</p>
          <Link 
            href="/app" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Enter App
          </Link>
        </div>
      </div>
    </div>
  );
}
