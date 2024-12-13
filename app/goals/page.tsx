'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().split('T')[0];

interface Metric {
  name: string;
  value: number | string;
  type: 'number' | 'string';
  unit?: string;
  date?: string;
  isEditable?: boolean;
}

interface Empire {
  name: string;
  description: string;
  metrics: Metric[];
}

export default function GoalsPage() {
  const [empires, setEmpires] = useState<Empire[]>([
    {
      name: "Mind Empire",
      description: "Expanding knowledge and wisdom through learning and creation",
      metrics: [
        { name: "Books Read This Year", value: 0, type: "number", isEditable: true },
        { name: "App Users", value: 0, type: "number", isEditable: true },
        { name: "Annual Income", value: 86000, type: "number", unit: "$", isEditable: true }
      ]
    },
    {
      name: "Gut Empire",
      description: "Maintaining peak health and energy",
      metrics: [
        { name: "Hollow Cheeks", value: "Maintaining", type: "string" },
        { name: "Peak Energy", value: "Sustaining", type: "string" },
        { name: "Feeling Calm", value: "Consistent", type: "string" },
        { name: "Glowing Skin", value: "Radiating", type: "string" }
      ]
    },
    {
      name: "Body Empire",
      description: "Building strength and endurance",
      metrics: [
        { name: "Power Clean Record", value: 0, type: "number", unit: "lbs", isEditable: true },
        { name: "Bench Press (225) Record", value: 5, type: "number", unit: "reps", isEditable: true },
        { name: "Running Record", value: 15, type: "number", unit: "km/hour", isEditable: true },
        { name: "Flexibility Goal", value: "Never Get Injured", type: "string" }
      ]
    },
    {
      name: "Heart Empire",
      description: "Nurturing relationships and connections",
      metrics: [
        { name: "Birthday Wishes", value: 0, type: "number", date: today, isEditable: true },
        { name: `Wedding Invites (${currentYear})`, value: 1, type: "number", isEditable: true },
        { name: "Wedding Invites (All-Time Record)", value: 1, type: "number", isEditable: true },
        { name: "Family Strength", value: "Sustaining Strong Family", type: "string" }
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
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              </div>
              <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              </div>
              <div className="absolute top-40 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
              </div>
              <div className="absolute top-52 left-1/2 -translate-x-1/2 z-10">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              </div>
            </div>

            <div className="relative h-64 flex flex-col justify-between py-8">
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-blue-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-blue-400 whitespace-nowrap">Mind Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-red-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-red-400 whitespace-nowrap">Heart Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-purple-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-purple-400 whitespace-nowrap">Gut Empire</span>
              </div>
              
              <div className="flex items-center gap-2 relative">
                <div className="absolute right-full w-16 h-[2px] bg-green-500/30 -translate-x-2"></div>
                <span className="text-sm font-medium text-green-400 whitespace-nowrap">Body Empire</span>
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
              <p className="text-gray-400 mb-6">{empire.description}</p>
              <div className="space-y-4">
                {empire.metrics.map((metric, metricIndex) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <span className="text-gray-300">{metric.name}</span>
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
