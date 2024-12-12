'use client';

import { useState, useEffect } from 'react';
import _QuoteDisplay from '../components/QuoteDisplay';
import Link from 'next/link';
import BodyVisualizer from '../components/BodyVisualizer';

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
        { 
          name: "Birthday Wishes", 
          value: 0, 
          type: "number",
          date: new Date().toISOString().split('T')[0],
          isEditable: true 
        },
        { 
          name: `Wedding Invites (${new Date().getFullYear()})`, 
          value: 1, 
          type: "number",
          isEditable: true 
        },
        { 
          name: "Wedding Invites (All-Time Record)", 
          value: 1, 
          type: "number",
          isEditable: true 
        },
        { name: "Family Strength", value: "Sustaining Strong Family", type: "string" }
      ]
    }
  ]);

  const [selectedPart, setSelectedPart] = useState<string>();

  // Load saved values from localStorage on component mount
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
    // Save to localStorage
    localStorage.setItem('empires', JSON.stringify(updatedEmpires));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <BodyVisualizer 
            selectedPart={selectedPart}
            onPartClick={setSelectedPart}
          />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Empire Building</h1>
        <p className="text-xl text-gray-400 italic mb-2">
          Bert, you have the chance to build something really special for the world.
        </p>
        <p className="text-lg text-gray-400 italic">
          Your mix of energy (body), empathy (heart), vibrance (gut), and intelligence (mind) all in the top 1% makes you a unicorn.
        </p>
      </div>

      {/* Empires */}
      <div className="grid gap-6">
        {empires.map((empire, empireIndex) => (
          <div key={empire.name} className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">{empire.name}</h2>
            <p className="text-gray-400 mb-4">{empire.description}</p>
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
                          className="bg-gray-700 text-white px-3 py-1 rounded w-24 text-right"
                        />
                        {metric.date && (
                          <input
                            type="date"
                            value={metric.date}
                            onChange={(e) => handleMetricUpdate(empireIndex, metricIndex, metric.value, e.target.value)}
                            className="bg-gray-700 text-white px-3 py-1 rounded"
                          />
                        )}
                      </>
                    ) : (
                      <span className="text-blue-400">{metric.value}</span>
                    )}
                    {metric.unit && <span className="text-gray-400 ml-2">{metric.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Button */}
      <div className="mt-8 flex justify-center">
        <Link 
          href="/calendar" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          View Weekly Schedule
          <span className="text-xl">→</span>
        </Link>
      </div>
    </div>
  );
}
