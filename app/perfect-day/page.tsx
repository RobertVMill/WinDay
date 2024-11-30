'use client';

import { useState } from 'react';

interface DayTemplate {
  id: string;
  title: string;
  description: string;
  timeline: {
    time: string;
    activity: string;
    mindset?: string;
    optimalState?: string;
  }[];
  keyFocuses: string[];
  perfectState: string[];
}

const templates: DayTemplate[] = [
  {
    id: 'deep-work',
    title: 'Deep Work Day',
    description: 'Optimized for maximum focus, energy, and deep work state',
    timeline: [
      { 
        time: '5:00 AM', 
        activity: '[WJG] Wake up',
        mindset: 'Max gratitude',
        optimalState: 'Feeling excited for the day'
      },
      { 
        time: '5:00-5:05 AM', 
        activity: 'Stretch',
        mindset: 'Build energy',
        optimalState: 'Body feels energized'
      },
      { 
        time: '5:05-5:30 AM', 
        activity: 'Meditate',
        mindset: 'Sharpen',
        optimalState: 'Everything falls away'
      },
      { 
        time: '5:30-6:30 AM', 
        activity: 'Workout',
        mindset: 'Damage and breathe',
        optimalState: 'Feeling flooded with epinephrine'
      },
      { 
        time: '6:30-6:40 AM', 
        activity: 'Wash up',
        mindset: 'Hygiene',
        optimalState: 'Feeling confident, skin glowing'
      },
      { 
        time: '6:40-6:50 AM', 
        activity: 'Dress',
        mindset: 'Comfort, confidence',
        optimalState: 'Feeling really comfortable and confident'
      },
      { 
        time: '6:50-7:00 AM', 
        activity: 'Walk to work',
        mindset: 'Pace',
        optimalState: 'Feeling really excited to work'
      },
      { 
        time: '7:00 AM-5:00 PM', 
        activity: 'Deep work',
        mindset: 'Dopamine',
        optimalState: 'All time falls away, feeling deep and euphoric'
      },
      { 
        time: '5:00-6:00 PM', 
        activity: 'Walk to grab dinner',
        mindset: 'Reflect',
        optimalState: 'Feeling refreshed for the next bout of work'
      },
      { 
        time: '6:00-7:00 PM', 
        activity: 'Dinner',
        mindset: 'Slow down',
        optimalState: 'Enjoying my food, not feeling like I need more'
      },
      { 
        time: '7:00-8:20 PM', 
        activity: 'Deep work',
        mindset: 'Dopamine',
        optimalState: 'Everything falls away, you feel deep and euphoric'
      },
      { 
        time: '8:20-8:30 PM', 
        activity: 'Walk home',
        mindset: 'Relax',
        optimalState: 'Ready for the end of the day'
      },
      { 
        time: '8:30-8:40 PM', 
        activity: 'CSW (Change, Stretch, Wash)',
        mindset: 'Hygiene',
        optimalState: 'Skin glowing'
      },
      { 
        time: '8:40-9:10 PM', 
        activity: 'Watch TV show',
        mindset: 'Let go',
        optimalState: 'Actually enjoying what I\'m watching'
      },
      { 
        time: '9:10-9:20 PM', 
        activity: 'Nidra',
        mindset: 'Relax',
        optimalState: 'Each part of my body is ready for rest'
      },
      { 
        time: '9:20-9:30 PM', 
        activity: 'Read til sleepy',
        mindset: 'Two more pages',
        optimalState: 'Read a few more pages to set yourself up for sleep'
      },
      { 
        time: '9:30 PM', 
        activity: 'Sleep Deep',
        mindset: 'Ease into it',
        optimalState: 'Peaceful transition to rest'
      }
    ],
    keyFocuses: [
      'Maximum energy management',
      'Deep work state maintenance',
      'Mindful transitions',
      'Deliberate practice'
    ],
    perfectState: [
      'Sustained flow state throughout deep work',
      'High energy maintained through proper pacing',
      'Sharp mental clarity',
      'Peaceful and productive transitions'
    ]
  },
  {
    id: 'creative',
    title: 'Creative Day',
    description: 'Designed for maximum creative output and inspiration',
    timeline: [
      { time: '7:00 AM', activity: 'Wake up naturally' },
      { time: '7:30 AM', activity: 'Light yoga & Meditation' },
      { time: '8:30 AM', activity: 'Inspirational reading' },
      { time: '9:30 AM', activity: 'Creative work session 1' },
      { time: '11:00 AM', activity: 'Nature walk' },
      { time: '12:00 PM', activity: 'Lunch & Art viewing' },
      { time: '1:30 PM', activity: 'Creative work session 2' },
      { time: '3:30 PM', activity: 'Collaboration/Feedback' },
      { time: '4:30 PM', activity: 'Final touches & Review' },
      { time: '5:30 PM', activity: 'End of day reflection' },
    ],
    keyFocuses: [
      'Stay open to inspiration',
      'Balance structure and flexibility',
      'Embrace experimentation',
      'Connect with other creatives'
    ],
    perfectState: [
      'Inspired and energized',
      'Mentally stimulated',
      'Creatively satisfied',
      'Connected to artistic purpose'
    ]
  },
  {
    id: 'meeting',
    title: 'Meeting-Heavy Day',
    description: 'Structured for effective communication and collaboration',
    timeline: [
      { time: '7:00 AM', activity: 'Early start & Quick workout' },
      { time: '8:00 AM', activity: 'Meeting prep & Agenda review' },
      { time: '9:00 AM', activity: 'Team standup' },
      { time: '10:00 AM', activity: 'Stakeholder meetings' },
      { time: '12:00 PM', activity: 'Lunch & Quick recharge' },
      { time: '1:00 PM', activity: 'Project reviews' },
      { time: '3:00 PM', activity: 'Team collaboration' },
      { time: '4:00 PM', activity: 'Action items & Follow-ups' },
      { time: '5:00 PM', activity: 'Day wrap-up' },
    ],
    keyFocuses: [
      'Clear communication',
      'Active listening',
      'Efficient time management',
      'Action-oriented outcomes'
    ],
    perfectState: [
      'Energetic and engaged',
      'Mentally present',
      'Effectively communicating',
      'Building relationships'
    ]
  }
];

export default function PerfectDayPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Perfect Day Templates
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 
              cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedTemplate(template)}
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {template.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {template.description}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTemplate.title}
                </h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Timeline</h3>
                  <div className="space-y-2">
                    {selectedTemplate.timeline.map((item, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="grid grid-cols-[120px_1fr] gap-4 mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.time}</div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{item.activity}</div>
                        </div>
                        <div className="ml-[120px] space-y-1">
                          {item.mindset && (
                            <div className="text-sm">
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Mindset:</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">{item.mindset}</span>
                            </div>
                          )}
                          {item.optimalState && (
                            <div className="text-sm">
                              <span className="text-green-600 dark:text-green-400 font-medium">Optimal State:</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">{item.optimalState}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Key Focuses</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedTemplate.keyFocuses.map((focus, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">{focus}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Perfect State</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedTemplate.perfectState.map((state, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">{state}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
