'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Metric {
  name: string;
  value: number | string;
  type: 'number' | 'string';
  unit?: string;
  date?: string;
  isEditable?: boolean;
  goal?: number;
  subnote?: string;
}

interface Empire {
  name: string;
  description: string;
  note: string;
  metrics: Metric[];
}

export default function GoalsPage() {
  const [empires, setEmpires] = useState<Empire[]>([
    {
      name: "Mind Empire",
      description: "Sharp like a scalpel",
      note: "Love the process of concentrating the value of your insights on AI, and watch the money grow",
      metrics: [
        { 
          name: "Books Read This Year", 
          value: 0, 
          type: "number", 
          isEditable: true,
          goal: 50,
          unit: "books",
          subnote: "Train your brain on the world's best data (books)"
        },
        { 
          name: "Fireside Tech subscribers", 
          value: 0, 
          type: "number", 
          isEditable: true,
          goal: 100,
          unit: "subscribers",
          subnote: "Increase your chance of getting hired for a $200k job from 20% to 90%"
        },
        { 
          name: "The Inference subscribers", 
          value: 270, 
          type: "number", 
          isEditable: true,
          goal: 1000,
          unit: "subscribers",
          subnote: "Increase your TAM from 1000 people to 100,000 people"
        },
        { 
          name: "Annual Income", 
          value: 86000, 
          type: "number", 
          unit: "$", 
          isEditable: true,
          goal: 150000,
          subnote: "Buy your mom whatever she needs"
        },
        {
          name: "EvidentLM Size",
          value: 800,
          type: "number",
          unit: "KB",
          isEditable: true,
          goal: 10240,
          subnote: "Evident holds your ticket to a $200K job, 10MB of knowledge increases that chance you get recommended from 20% to 90%"
        }
      ]
    },
    {
      name: "Gut Empire",
      description: "Flourishing like a garden",
      note: "Love the process of cultivating the powerhouse of Serotonin (Mood), GABA (Calm), Dopamine (Focus), Acetylcholine (Memory), Melatonin (Sleep), Endorphins (Pleasure), Anandamide (Happiness), Glutamate (Learning), Histamine (Alertness), Butyrate (Anti-inflammatory)",
      metrics: [
        { 
          name: "Hollow Cheeks", 
          value: 3, 
          type: "number", 
          isEditable: true,
          goal: 5,
          unit: "/ 5",
          subnote: "Increases your friendships with girls from 5 to 5000 - making for a much more enjoyable life"
        },
        { 
          name: "Peak Energy", 
          value: 3, 
          type: "number", 
          isEditable: true,
          goal: 5,
          unit: "/ 5",
          subnote: "The ultimate differentiated market value"
        },
        { 
          name: "Feeling Calm", 
          value: 3, 
          type: "number", 
          isEditable: true,
          goal: 5,
          unit: "/ 5",
          subnote: "The only way to keep compounding"
        },
        { 
          name: "Glowing Skin", 
          value: 3, 
          type: "number", 
          isEditable: true,
          goal: 5,
          unit: "/ 5",
          subnote: "Increases your friendships with girls from 5 to 5000 - making for a much more enjoyable life"
        }
      ]
    },
    {
      name: "Body Empire",
      description: "Forged like steel",
      note: "Love the process of damaging and repairing your body into a piece of material that any woman feels a strong tendancy to sleep with",
      metrics: [
        { 
          name: "Power Clean Record", 
          value: 205, 
          type: "number", 
          unit: "lbs", 
          isEditable: true,
          goal: 275,
          subnote: "Increases your energy levels, and your friendships with girls from 5 to 5000"
        },
        { 
          name: "Bench Press (225) Record", 
          value: 5, 
          type: "number", 
          unit: "reps", 
          isEditable: true,
          goal: 10,
          subnote: "Increases your energy levels, and your friendships with girls from 5 to 5000"
        },
        { 
          name: "Running Record", 
          value: 12, 
          type: "number", 
          unit: "km/hour", 
          isEditable: true,
          goal: 15,
          subnote: "Build off the charts endurance that can't be competed with in the workplace"
        },
        { 
          name: "Flexibility", 
          value: 3, 
          type: "number", 
          unit: "/ 5", 
          isEditable: true,
          goal: 5,
          subnote: "Being able to let the compounding happen for 5 years to 50 years"
        }
      ]
    },
    {
      name: "Heart Empire",
      description: "Vibrant like a fireplace",
      note: "Love the process of giving 10X to people, listening your ass off, and saying the uncomfortable thing, and watch how much more calm, joyful and satisfied you feel",
      metrics: [
        { 
          name: "Birthday Wishes", 
          value: 5, 
          type: "number", 
          isEditable: true,
          goal: 50,
          unit: "wishes",
          subnote: "Increase your support network, increase your joy, and increase your serotonin"
        },
        { 
          name: "Cards Written", 
          value: 0, 
          type: "number", 
          isEditable: true,
          goal: 10,
          unit: "cards",
          subnote: "This is the highest leverage of kindness and will all come back to you"
        },
        { 
          name: "Family Strength", 
          value: 3, 
          type: "number", 
          isEditable: true,
          goal: 5,
          unit: "/ 5",
          subnote: "This is the ultimate level of a successful human"
        }
      ]
    }
  ]);

  useEffect(() => {
    const savedEmpires = localStorage.getItem('empires');
    if (savedEmpires) {
      setEmpires(JSON.parse(savedEmpires));
    }
  }, []);

  const handleMetricUpdate = (empireIndex: number, metricIndex: number, newValue: number | string, date?: string) => {
    const updatedEmpires = [...empires];
    updatedEmpires[empireIndex].metrics[metricIndex].value = newValue;
    if (date) {
      updatedEmpires[empireIndex].metrics[metricIndex].date = date;
    }
    setEmpires(updatedEmpires);
    localStorage.setItem('empires', JSON.stringify(updatedEmpires));
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-16 text-center">
          <blockquote className="relative">
            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl font-light text-gray-200 italic mb-4">
                "The Goal of life is to love the process. To jump out of bed excited each morning. Because the more you love the process, the happier you are, and the more you can support those around you."
              </p>
              <p className="text-lg sm:text-xl font-light text-gray-400 italic">
                I've made the conscious choice to choose my self development as the process because I think it's the only thing I really have control over, and the highest lever of service for the world.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-0"></div>
          </blockquote>
        </div>

        <div className="mb-20">
          <div className="relative w-[400px] h-[400px] mx-auto">
            {/* Center circle with "The Process" text */}
            <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-yellow-600/20 via-red-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <span className="text-lg font-medium text-white">The Process</span>
            </div>
            
            {/* Process steps in a circle */}
            {[
              { name: 'Sleep', icon: '😴', color: 'from-yellow-500 via-red-500 via-blue-500 to-green-500' },
              { name: 'Meditation', icon: '🧘', color: 'from-yellow-500 to-red-500' },
              { name: 'Workout', icon: '💪', color: 'from-green-500 to-yellow-500' },
              { name: 'Learning', icon: '📚', color: 'from-yellow-500 to-red-500' },
              { name: 'Creativity', icon: '🎨', color: 'from-yellow-500 to-red-500' },
              { name: 'Connection', icon: '🤝', color: 'from-red-500 to-blue-500' },
              { name: 'Nourish', icon: '🌱', color: 'from-blue-500 to-green-500' }
            ].map((step, index) => {
              const angle = (index * (360 / 7) - 90) * (Math.PI / 180);
              const radius = 160; // Adjust this value to change the circle size
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);

              return (
                <div
                  key={step.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${50 + (x / radius) * 50}%`,
                    top: `${50 + (y / radius) * 50}%`
                  }}
                >
                  <div className={`
                    w-16 h-16 rounded-full 
                    bg-gradient-to-br ${step.color}
                    flex flex-col items-center justify-center
                    shadow-lg shadow-black/50
                    border border-white/10
                    group
                    transition-all duration-300 hover:scale-110
                  `}>
                    <span className="text-2xl mb-1">{step.icon}</span>
                    <span className="absolute w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium text-white -bottom-6">
                      {step.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Connecting lines */}
            <svg
              className="absolute inset-0 w-full h-full -z-10"
              viewBox="0 0 400 400"
            >
              <circle
                cx="200"
                cy="200"
                r="160"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-30"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EAB308" />
                  <stop offset="33%" stopColor="#EF4444" />
                  <stop offset="66%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="relative w-full flex justify-center mb-12">
          <div className="relative flex items-center justify-center gap-20 w-[600px]">
            <div className="relative w-64 h-64 flex-shrink-0">
              <Image
                src="/silhouette.png"
                alt="Silhouette"
                fill
                className="object-contain opacity-90"
                priority
              />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
              </div>
              <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              </div>
              <div className="absolute top-40 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              </div>
              <div className="absolute top-52 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
            </div>

            <div className="relative h-64 flex flex-col justify-between py-8">
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-yellow-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-yellow-400 whitespace-nowrap">Mind Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-red-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-red-400 whitespace-nowrap">Heart Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-blue-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-blue-400 whitespace-nowrap">Gut Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-green-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-green-400 whitespace-nowrap">Body Empire</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-16 bg-gray-800/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">Surviving the Pace</h2>
          <p className="text-xl text-gray-300 mb-6">Take your serotonin levels very seriously</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">☀️</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Sunlight</h3>
              <p className="text-gray-400">Early morning sun exposure sets your circadian rhythm and boosts serotonin production</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🚶‍♂️</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Long Walks</h3>
              <p className="text-gray-400">Daily walks in nature combine movement, sunlight, and mental restoration</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">😴</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Long Sleeps</h3>
              <p className="text-gray-400">Sleep as long as your body needs to restore serotonin and repair neural pathways</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🧘‍♂️</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Daily Meditation</h3>
              <p className="text-gray-400">Regular meditation increases serotonin and reduces cortisol levels</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🥬</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Fiber</h3>
              <p className="text-gray-400">High-fiber foods support gut bacteria that produce 90% of your serotonin</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Friendships</h3>
              <p className="text-gray-400">Social connections and deep friendships naturally boost serotonin levels</p>
            </div>
          </div>
        </div>

        <div className="mb-16 bg-gray-800/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">World View</h2>
          <p className="text-xl text-gray-300 mb-6">Waves to ride until 2030</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">AI Will Eat All of Business</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Every business process will be transformed by AI, creating unprecedented opportunities for those who understand and can implement AI solutions.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Automation</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Optimization</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Transformation</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🦅</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">US Will Continue to Dominate in AI</h3>
              <div className="space-y-3">
                <p className="text-gray-400">The combination of top talent, capital, and entrepreneurial culture will keep the US at the forefront of AI innovation and implementation.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Innovation</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Leadership</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Opportunity</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Evident AI is Your Gateway</h3>
              <div className="space-y-3">
                <p className="text-gray-400">Evident AI will continue to grow 10X in importance, representing your best opportunity to enter the US market and establish yourself in AI.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">Growth</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">US Entry</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300">AI Career</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">Goals & Empire Building</h1>
          <p className="text-gray-400 mt-2">Track your progress across different domains of life.</p>
        </div>

        <div className="grid gap-8">
          {empires.map((empire, empireIndex) => (
            <div key={empire.name} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-2">{empire.name}</h2>
              <p className="text-gray-400 mb-2">{empire.description}</p>
              <p className="text-sm text-gray-500 italic mb-6">{empire.note}</p>
              <div className="space-y-4">
                {empire.metrics.map((metric, metricIndex) => (
                  <div key={metric.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{metric.name}</span>
                        {metric.name === "Books Read This Year" && (
                          <Link 
                            href="/books" 
                            className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full transition-all duration-200"
                          >
                            View Books →
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.type === 'number' && metric.isEditable ? (
                          <>
                            <input
                              type="number"
                              value={metric.value}
                              onChange={(e) => handleMetricUpdate(empireIndex, metricIndex, Number(e.target.value))}
                              className="bg-gray-700/50 text-white px-4 py-2 rounded-lg w-28 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {metric.date && (
                              <input
                                type="date"
                                value={metric.date}
                                onChange={(e) => handleMetricUpdate(empireIndex, metricIndex, metric.value, e.target.value)}
                                className="bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </>
                        ) : (
                          <span className="text-blue-400 font-medium">{metric.value}</span>
                        )}
                        {metric.unit && <span className="text-gray-400 ml-2">{metric.unit}</span>}
                      </div>
                    </div>
                    {metric.subnote && (
                      <p className="text-sm text-gray-500 italic">
                        {metric.subnote}
                      </p>
                    )}
                    {metric.goal && typeof metric.value === 'number' && (
                      <div className="w-full">
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (metric.value / metric.goal) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">0</span>
                          <span className="text-xs text-gray-400">Goal: {metric.goal.toLocaleString()} {metric.unit}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link 
            href="/calendar" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-3 hover:scale-105 shadow-xl shadow-blue-500/20"
          >
            View Weekly Schedule
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
