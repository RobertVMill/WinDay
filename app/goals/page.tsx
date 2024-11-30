'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NorthStarVision {
  id: number;
  content: string;
  target_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface BHAG {
  id: number;
  vision_id: number;
  content: string;
  target_date: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

interface Milestone {
  id: number;
  bhag_id: number;
  content: string;
  target_date: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

interface Step {
  id: number;
  milestone_id: number;
  content: string;
  target_date: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

interface TimelineItem {
  id: number;
  type: 'vision' | 'bhag' | 'milestone';
  content: string;
  target_date: string | null;
  completed: boolean;
  completed_date?: string;
}

export default function GoalsPage() {
  const [vision, setVision] = useState<NorthStarVision | null>(null);
  const [bhags, setBhags] = useState<BHAG[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<'vision' | 'bhag'>('vision');
  const [newVision, setNewVision] = useState({
    content: '',
    target_date: '',
    notes: ''
  });
  const [newBhag, setNewBhag] = useState({
    content: '',
    target_date: '',
    notes: ''
  });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [selectedBhagId, setSelectedBhagId] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    content: '',
    target_date: '',
    notes: ''
  });
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch active North Star Vision
      const { data: visionData, error: visionError } = await supabase
        .from('north_star_vision')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      console.log('Vision Data:', visionData);
      if (visionError) {
        console.error('Vision Error:', visionError);
        throw visionError;
      }

      setVision(visionData);

      if (visionData) {
        // Fetch BHAGs for this vision
        const { data: bhagsData, error: bhagsError } = await supabase
          .from('bhags')
          .select('*')
          .eq('vision_id', visionData.id)
          .order('created_at', { ascending: true });

        console.log('BHAGs Data:', bhagsData);
        if (bhagsError) {
          console.error('BHAGs Error:', bhagsError);
          throw bhagsError;
        }

        setBhags(bhagsData || []);

        if (bhagsData && bhagsData.length > 0) {
          // Fetch milestones for these BHAGs
          const { data: milestonesData, error: milestonesError } = await supabase
            .from('milestones')
            .select('*')
            .in('bhag_id', bhagsData.map(b => b.id))
            .order('created_at', { ascending: true });

          console.log('Milestones Data:', milestonesData);
          if (milestonesError) {
            console.error('Milestones Error:', milestonesError);
            throw milestonesError;
          }

          setMilestones(milestonesData || []);

          if (milestonesData && milestonesData.length > 0) {
            // Fetch steps for these milestones
            const { data: stepsData, error: stepsError } = await supabase
              .from('steps')
              .select('*')
              .in('milestone_id', milestonesData.map(m => m.id))
              .order('created_at', { ascending: true });

            console.log('Steps Data:', stepsData);
            if (stepsError) {
              console.error('Steps Error:', stepsError);
              throw stepsError;
            }

            setSteps(stepsData || []);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Failed to load vision data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (formType === 'vision') {
        const { data, error } = await supabase
          .from('north_star_vision')
          .insert([{
            content: newVision.content,
            target_date: newVision.target_date || null,
            notes: newVision.notes || null,
            is_active: true
          }])
          .select()
          .single();

        if (error) throw error;

        setVision(data);
        setShowAddForm(false);
        setNewVision({ content: '', target_date: '', notes: '' });
      } else if (formType === 'bhag' && vision) {
        console.log('Creating BHAG with data:', {
          vision_id: vision.id,
          content: newBhag.content,
          target_date: newBhag.target_date || null,
          notes: newBhag.notes || null,
          completed: false
        });
        
        const { data, error } = await supabase
          .from('bhags')
          .insert([{
            vision_id: vision.id,
            content: newBhag.content,
            target_date: newBhag.target_date || null,
            notes: newBhag.notes || null,
            completed: false
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating BHAG:', error);
          throw error;
        }

        console.log('Successfully created BHAG:', data);
        setBhags([...bhags, data]);
        setShowAddForm(false);
        setNewBhag({ content: '', target_date: '', notes: '' });
      }
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err?.message || 'Failed to save. Please try again.');
    }
  }

  async function handleMilestoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!selectedBhagId) return;

      console.log('Creating milestone with data:', {
        bhag_id: selectedBhagId,
        content: newMilestone.content,
        target_date: newMilestone.target_date || null,
        notes: newMilestone.notes || null,
        completed: false
      });

      const { data, error } = await supabase
        .from('milestones')
        .insert([{
          bhag_id: selectedBhagId,
          content: newMilestone.content,
          target_date: newMilestone.target_date || null,
          notes: newMilestone.notes || null,
          completed: false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating milestone:', error);
        throw error;
      }

      console.log('Successfully created milestone:', data);
      setMilestones([...milestones, data]);
      setShowMilestoneForm(false);
      setSelectedBhagId(null);
      setNewMilestone({ content: '', target_date: '', notes: '' });
    } catch (err: any) {
      console.error('Error adding milestone:', err);
      setError(err?.message || 'Failed to save milestone. Please try again.');
    }
  }

  async function deleteBhag(bhagId: number) {
    try {
      console.log('Deleting BHAG:', bhagId);
      const { error } = await supabase
        .from('bhags')
        .delete()
        .eq('id', bhagId);

      if (error) {
        console.error('Error deleting BHAG:', error);
        throw error;
      }

      console.log('Successfully deleted BHAG');
      setBhags(bhags.filter(bhag => bhag.id !== bhagId));
    } catch (err: any) {
      console.error('Error deleting BHAG:', err);
      setError(err?.message || 'Failed to delete BHAG. Please try again.');
    }
  }

  async function toggleBhagComplete(bhagId: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('bhags')
        .update({ completed })
        .eq('id', bhagId);

      if (error) throw error;

      setBhags(bhags.map(bhag => 
        bhag.id === bhagId ? { ...bhag, completed } : bhag
      ));
    } catch (err: any) {
      console.error('Error updating BHAG:', err);
      setError(err?.message || 'Failed to update BHAG. Please try again.');
    }
  }

  async function toggleMilestoneComplete(milestone: Milestone, completed: boolean) {
    try {
      // Update local state immediately for responsive UI
      setMilestones(milestones.map(m =>
        m.id === milestone.id ? { ...m, completed } : m
      ));

      // Then update the database
      const { error } = await supabase
        .from('milestones')
        .update({ completed })
        .eq('id', milestone.id);

      if (error) {
        // If there's an error, revert the local state
        console.error('Error updating milestone:', error);
        setMilestones(milestones.map(m =>
          m.id === milestone.id ? { ...m, completed: !completed } : m
        ));
        throw error;
      }

      console.log('Successfully updated milestone completion:', { id: milestone.id, completed });
    } catch (err: any) {
      console.error('Error updating milestone:', err);
      setError(err?.message || 'Failed to update milestone. Please try again.');
    }
  }

  function renderForm() {
    const isVisionForm = formType === 'vision';
    const formData = isVisionForm ? newVision : newBhag;
    const setFormData = isVisionForm ? setNewVision : setNewBhag;

    return (
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isVisionForm ? 'North Star Vision' : 'Big Hairy Audacious Goal (BHAG)'}
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              rows={3}
              placeholder={`Enter your ${isVisionForm ? 'North Star Vision' : 'BHAG'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              rows={2}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Save {isVisionForm ? 'Vision' : 'BHAG'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false);
              setFormType('vision');
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderMilestoneForm() {
    return (
      <form onSubmit={handleMilestoneSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Milestone
            </label>
            <textarea
              required
              value={newMilestone.content}
              onChange={(e) => setNewMilestone({ ...newMilestone, content: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              rows={3}
              placeholder="Enter your milestone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={newMilestone.target_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, target_date: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={newMilestone.notes}
              onChange={(e) => setNewMilestone({ ...newMilestone, notes: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              rows={2}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Save Milestone
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMilestoneForm(false);
              setSelectedBhagId(null);
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function getTimelineItems(): TimelineItem[] {
    const items: TimelineItem[] = [];
    
    // Add vision if it exists
    if (vision && vision.target_date) {
      items.push({
        id: vision.id,
        type: 'vision',
        content: vision.content,
        target_date: vision.target_date,
        completed: false
      });
    }

    // Add BHAGs
    bhags.forEach(bhag => {
      if (bhag.target_date) {
        items.push({
          id: bhag.id,
          type: 'bhag',
          content: bhag.content,
          target_date: bhag.target_date,
          completed: bhag.completed
        });
      }
    });

    // Add Milestones
    milestones.forEach(milestone => {
      if (milestone.target_date) {
        items.push({
          id: milestone.id,
          type: 'milestone',
          content: milestone.content,
          target_date: milestone.target_date,
          completed: milestone.completed
        });
      }
    });

    // Sort by target date
    return items.sort((a, b) => 
      new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime()
    );
  }

  function calculateTimelinePositions(items: TimelineItem[]) {
    if (items.length === 0) return [];

    // Sort items by date
    const sortedItems = [...items].sort((a, b) => 
      new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime()
    );

    // Use today's date as the start if it's before the first item
    const today = new Date().setHours(0, 0, 0, 0);
    const firstItemDate = new Date(sortedItems[0].target_date!).getTime();
    const startDate = Math.min(today, firstItemDate);
    
    // Add 20% more time to the end for future padding
    const endDate = new Date(sortedItems[sortedItems.length - 1].target_date!).getTime();
    const timeRange = endDate - startDate;
    const paddedEndDate = endDate + (timeRange * 0.2);

    // Calculate positions (15% to 95%) for each item to ensure padding
    return sortedItems.map(item => ({
      ...item,
      position: timeRange === 0 ? 50 : // If all dates are the same, center the item
        15 + ((new Date(item.target_date!).getTime() - startDate) / (paddedEndDate - startDate)) * 80
    }));
  }

  function renderTimeline() {
    const items = getTimelineItems();
    if (items.length === 0) return null;

    const positionedItems = calculateTimelinePositions(items);
    const minSpaceBetweenItems = 10; // Minimum space between items in percentage

    // Add today marker
    const today = new Date();
    const firstDate = new Date(items[0].target_date!);
    const lastDate = new Date(items[items.length - 1].target_date!);
    const showToday = today >= firstDate && today <= lastDate;

    return (
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Timeline</h2>
        <div className="relative" style={{ minWidth: '800px', height: '200px' }}>
          {/* Timeline line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Today marker */}
          {showToday && (
            <div 
              className="absolute top-0 bottom-0" 
              style={{ 
                left: `${15 + ((today.getTime() - new Date(items[0].target_date!).getTime()) / 
                  (new Date(items[items.length - 1].target_date!).getTime() - 
                   new Date(items[0].target_date!).getTime())) * 80}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute top-6 w-0.5 h-4 bg-red-500" />
              <div className="absolute top-4 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-medium text-red-500">Today</span>
              </div>
            </div>
          )}

          {/* Timeline items */}
          <div className="relative h-full">
            {positionedItems.map((item, index) => {
              // Adjust position if items are too close together
              let adjustedPosition = item.position;
              const prevItem = positionedItems[index - 1];
              if (prevItem && (item.position - prevItem.position) < minSpaceBetweenItems) {
                adjustedPosition = prevItem.position + minSpaceBetweenItems;
              }

              return (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="absolute top-0"
                  style={{ 
                    left: `${adjustedPosition}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Dot and Flag */}
                  <div className="relative">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 cursor-pointer
                        ${item.completed 
                          ? 'bg-green-500 border-green-600' 
                          : 'bg-blue-500 border-blue-600'}`}
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    />
                    {item.completed && (
                      <div className="absolute -right-2 -top-2">
                        <svg 
                          className="w-4 h-4 text-green-500" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(item.target_date!).toLocaleDateString()}
                  </div>

                  {/* Type indicator */}
                  <div className={`text-xs font-medium mt-1 whitespace-nowrap
                    ${item.type === 'vision' ? 'text-purple-600 dark:text-purple-400' :
                      item.type === 'bhag' ? 'text-blue-600 dark:text-blue-400' :
                      'text-indigo-600 dark:text-indigo-400'}`}
                  >
                    {item.type.toUpperCase()}
                  </div>

                  {/* Expandable content */}
                  <div 
                    className={`absolute top-16 -translate-x-1/2 w-48 transition-all duration-200 ease-in-out z-10
                      ${expandedItem === item.id 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border shadow-lg
                      border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.completed 
                          ? `Completed on ${new Date().toLocaleDateString()}`
                          : `Target: ${new Date(item.target_date!).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderMilestones(bhagId: number) {
    const bhagMilestones = milestones.filter(m => m.bhag_id === bhagId);
    if (bhagMilestones.length === 0) return null;

    return (
      <div className="ml-8 mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones:</h4>
        {bhagMilestones.map((milestone) => (
          <div key={milestone.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={milestone.completed || false}
              onChange={(e) => toggleMilestoneComplete(milestone, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className={`flex-1 ${milestone.completed ? 'text-gray-500 line-through' : ''}`}>
              <p className="text-gray-800 dark:text-gray-200">{milestone.content}</p>
              {milestone.target_date && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Target: {new Date(milestone.target_date).toLocaleDateString()}
                </p>
              )}
              {milestone.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{milestone.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderBhags() {
    return (
      <div className="space-y-4">
        {bhags.map((bhag) => (
          <div key={bhag.id} className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  North Star Vision
                </h2>
                <p className="text-gray-800 dark:text-gray-200">{bhag.content}</p>
                {bhag.target_date && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Target: {new Date(bhag.target_date).toLocaleDateString()}
                  </p>
                )}
                {bhag.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{bhag.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBhagId(bhag.id);
                    setShowMilestoneForm(true);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  + Add Milestone
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this BHAG?')) {
                      deleteBhag(bhag.id);
                    }
                  }}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            {renderMilestones(bhag.id)}
            {showMilestoneForm && selectedBhagId === bhag.id && renderMilestoneForm()}
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Vision & Goals</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Define your North Star vision, break it down into BHAGs (Big Hairy Audacious Goals),
          then into milestones, and finally into actionable steps.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {renderTimeline()}

      {!vision ? (
        <div className="mb-8">
          {!showAddForm ? (
            <button
              onClick={() => {
                setFormType('vision');
                setShowAddForm(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              + Add North Star Vision
            </button>
          ) : (
            renderForm()
          )}
        </div>
      ) : (
        <>
          <div className="mb-8 bg-indigo-50 dark:bg-indigo-900 p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  North Star Vision
                </h2>
                <p className="text-gray-800 dark:text-gray-200">{vision.content}</p>
                {vision.target_date && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Target: {new Date(vision.target_date).toLocaleDateString()}
                  </p>
                )}
                {vision.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{vision.notes}</p>
                )}
              </div>
              {!showAddForm && (
                <button
                  onClick={() => {
                    setFormType('bhag');
                    setShowAddForm(true);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  + Add BHAG
                </button>
              )}
            </div>
          </div>

          {showAddForm && formType === 'bhag' ? (
            renderForm()
          ) : (
            renderBhags()
          )}
        </>
      )}
    </div>
  );
}
