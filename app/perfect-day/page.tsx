'use client';

import { useState } from 'react';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  mindset?: string;
  optimalState?: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
}

interface DayTemplate {
  id: string;
  title: string;
  description: string;
  timeBlocks: TimeBlock[];
  keyFocuses: string[];
  perfectState: string[];
}

const ENERGY_COLORS = {
  1: '#FF9B9B', // Low energy - soft red
  2: '#FFE59B', // Low-medium - soft yellow
  3: '#9BFFC4', // Medium - soft green
  4: '#9BB3FF', // Medium-high - soft blue
  5: '#E89BFF', // High energy - soft purple
};

const TIME_SLOTS = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = i % 2 === 0 ? '00' : '30';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
});

const _SLOT_HEIGHT = 80; // Height of each 30-minute slot in pixels

const DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
  { label: '4 hours', minutes: 240 },
];

export default function PerfectDayPage() {
  const [currentTemplate, setCurrentTemplate] = useState<DayTemplate>({
    id: 'new-template',
    title: 'My Perfect Day',
    description: '',
    timeBlocks: [],
    keyFocuses: [''],
    perfectState: ['']
  });

  const addTimeBlock = (startTime: string) => {
    // Find the next time slot as default end time
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endTime = TIME_SLOTS[Math.min(startIndex + 1, TIME_SLOTS.length - 1)];

    const newBlock: TimeBlock = {
      id: Math.random().toString(),
      startTime,
      endTime,
      activity: '',
      energyLevel: 3,
    };

    setCurrentTemplate({
      ...currentTemplate,
      timeBlocks: [...currentTemplate.timeBlocks, newBlock]
    });
  };

  const getBlockSpan = (block: TimeBlock) => {
    const startIndex = TIME_SLOTS.indexOf(block.startTime);
    const endIndex = TIME_SLOTS.indexOf(block.endTime);
    return Math.max(1, endIndex - startIndex + 1);
  };

  const isTimeSlotOccupied = (_timeSlot: string) => {
    return currentTemplate.timeBlocks.some(block => {
      const startIndex = TIME_SLOTS.indexOf(block.startTime);
      const endIndex = TIME_SLOTS.indexOf(block.endTime);
      const slotIndex = TIME_SLOTS.indexOf(_timeSlot);
      return slotIndex >= startIndex && slotIndex <= endIndex;
    });
  };

  const isTimeSlotStart = (_timeSlot: string) => {
    return currentTemplate.timeBlocks.some(block => block.startTime === _timeSlot);
  };

  const updateTimeBlock = (id: string, field: keyof TimeBlock, value: any) => {
    setCurrentTemplate({
      ...currentTemplate,
      timeBlocks: currentTemplate.timeBlocks.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    });
  };

  const addListItem = (field: 'keyFocuses' | 'perfectState') => {
    setCurrentTemplate({
      ...currentTemplate,
      [field]: [...currentTemplate[field], '']
    });
  };

  const updateListItem = (field: 'keyFocuses' | 'perfectState', index: number, value: string) => {
    const newList = [...currentTemplate[field]];
    newList[index] = value;
    setCurrentTemplate({ ...currentTemplate, [field]: newList });
  };

  const _handleResize = (_blockId: string, _height: number) => {
    // Implementation coming soon
  };

  const handleDragStart = (e: React.DragEvent, blockId: string, edge: 'top' | 'bottom') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ blockId, edge }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, _timeSlot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTimeSlot: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const block = currentTemplate.timeBlocks.find(b => b.id === data.blockId);
    
    if (!block) return;

    if (data.edge === 'bottom') {
      updateTimeBlock(data.blockId, 'endTime', targetTimeSlot);
    } else {
      updateTimeBlock(data.blockId, 'startTime', targetTimeSlot);
    }
  };

  const updateDuration = (blockId: string, durationMinutes: number) => {
    const block = currentTemplate.timeBlocks.find(b => b.id === blockId);
    if (!block) return;

    // Parse the start time
    const [hour, minute, period] = block.startTime.split(/[: ]/);
    const startHour = parseInt(hour) + (period === 'PM' && hour !== '12' ? 12 : 0);
    const startMinute = parseInt(minute);

    // Calculate end time
    let endHour = startHour + Math.floor(durationMinutes / 60);
    let endMinute = startMinute + (durationMinutes % 60);
    
    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }

    // Format end time
    const displayHour = endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const _endTime = `${displayHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;

    // Find the closest available time slot
    const closestSlot = TIME_SLOTS.find(slot => {
      const [slotHour, slotMinute, slotPeriod] = slot.split(/[: ]/);
      const compareHour = parseInt(slotHour) + (slotPeriod === 'PM' && slotHour !== '12' ? 12 : 0);
      const compareMinute = parseInt(slotMinute);
      
      return (compareHour > endHour) || 
             (compareHour === endHour && compareMinute >= endMinute);
    }) || TIME_SLOTS[TIME_SLOTS.length - 1];

    updateTimeBlock(blockId, 'endTime', closestSlot);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Craft Your Perfect Day
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Build your ideal day by adding activities. Each activity can span multiple time slots - perfect for both quick tasks and longer deep work sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        {/* Timeline Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Daily Timeline</h2>
          <div className="space-y-1 relative">
            {TIME_SLOTS.map((timeSlot) => {
              const blockStartingHere = currentTemplate.timeBlocks.find(block => block.startTime === timeSlot);
              const isOccupied = isTimeSlotOccupied(timeSlot);
              
              if (isOccupied && !isTimeSlotStart(timeSlot)) {
                return null;
              }

              return (
                <div key={timeSlot} 
                  className="flex items-start space-x-4 rounded-lg"
                  onDragOver={(e) => handleDragOver(e, timeSlot)}
                  onDrop={(e) => handleDrop(e, timeSlot)}
                >
                  <div className="w-32 flex-shrink-0 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{timeSlot}</div>
                  </div>
                  
                  {blockStartingHere ? (
                    <div className="flex-grow">
                      <div 
                        className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        style={{
                          minHeight: `${getBlockSpan(blockStartingHere) * 4}rem`
                        }}
                      >
                        {/* Top drag handle */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, blockStartingHere.id, 'top')}
                          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize bg-gray-200 hover:bg-gray-300 rounded-t-lg"
                        />
                        
                        <div className="space-y-3 mt-3">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{blockStartingHere.startTime} - {blockStartingHere.endTime}</span>
                            <select
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
                              onChange={(e) => updateDuration(blockStartingHere.id, parseInt(e.target.value))}
                              value={(() => {
                                const [startHour, startMinute, startPeriod] = blockStartingHere.startTime.split(/[: ]/);
                                const [endHour, endMinute, endPeriod] = blockStartingHere.endTime.split(/[: ]/);
                                
                                const start = parseInt(startHour) + (startPeriod === 'PM' && startHour !== '12' ? 12 : 0);
                                const end = parseInt(endHour) + (endPeriod === 'PM' && endHour !== '12' ? 12 : 0);
                                
                                const durationMinutes = ((end - start) * 60) + (parseInt(endMinute) - parseInt(startMinute));
                                
                                return durationMinutes;
                              })()}
                            >
                              {DURATIONS.map(({ label, minutes }) => (
                                <option key={minutes} value={minutes}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            value={blockStartingHere.activity}
                            onChange={(e) => updateTimeBlock(blockStartingHere.id, 'activity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="What are you doing?"
                          />
                          <div className="flex space-x-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={blockStartingHere.mindset || ''}
                                onChange={(e) => updateTimeBlock(blockStartingHere.id, 'mindset', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Mindset"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={blockStartingHere.optimalState || ''}
                                onChange={(e) => updateTimeBlock(blockStartingHere.id, 'optimalState', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Optimal State"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Energy Level:</span>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() => updateTimeBlock(blockStartingHere.id, 'energyLevel', level)}
                                className={`w-6 h-6 rounded-full transition-transform ${
                                  blockStartingHere.energyLevel === level ? 'transform scale-110 ring-2 ring-offset-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: ENERGY_COLORS[level as keyof typeof ENERGY_COLORS] }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Bottom drag handle */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, blockStartingHere.id, 'bottom')}
                          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize bg-gray-200 hover:bg-gray-300 rounded-b-lg"
                        />
                      </div>
                    </div>
                  ) : !isOccupied && (
                    <button
                      onClick={() => addTimeBlock(timeSlot)}
                      className="flex-grow flex items-center justify-center h-12 border-2 border-dashed border-gray-300 
                        rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      + Add Activity
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Focuses Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Key Focuses</h2>
              <button
                onClick={() => addListItem('keyFocuses')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Focus
              </button>
            </div>
            <div className="space-y-3">
              {currentTemplate.keyFocuses.map((focus, index) => (
                <input
                  key={index}
                  type="text"
                  value={focus}
                  onChange={(e) => updateListItem('keyFocuses', index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter a key focus..."
                />
              ))}
            </div>
          </div>

          {/* Perfect State Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Perfect State</h2>
              <button
                onClick={() => addListItem('perfectState')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add State
              </button>
            </div>
            <div className="space-y-3">
              {currentTemplate.perfectState.map((state, index) => (
                <input
                  key={index}
                  type="text"
                  value={state}
                  onChange={(e) => updateListItem('perfectState', index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Describe your perfect state..."
                />
              ))}
            </div>
          </div>

          {/* Energy Level Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Energy Levels</h2>
            <div className="space-y-2">
              {Object.entries(ENERGY_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Level {level} Energy
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
