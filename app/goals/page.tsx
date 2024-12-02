'use client';

import { useState, useEffect, useRef } from 'react';
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

interface TimelineItem {
  id: number;
  content: string;
  target_date: string;
  completed?: boolean;
  type: 'vision' | 'bhag' | 'milestone';
  position: number;
}

export default function GoalsPage() {
  const [vision, setVision] = useState<NorthStarVision | null>(null);
  const [bhags, setBhags] = useState<BHAG[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState<'vision' | 'bhag'>('vision');
  const [editingVision, setEditingVision] = useState(false);
  const [editingBhagId, setEditingBhagId] = useState<number | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
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
  const [timelineZoom, setTimelineZoom] = useState(100); // percentage
  const [timelinePan, setTimelinePan] = useState(0); // pixels
  const isDragging = useRef(false);
  const lastDragX = useRef(0);

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
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching data:', error.message);
      } else {
        console.error('An unknown error occurred while fetching data');
      }
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleVisionSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('north_star_vision')
        .insert([{
          content: editFormData.content,
          target_date: editFormData.target_date,
          notes: editFormData.notes,
          is_active: true
        }]);

      if (error) throw error;

      fetchAllData();
      setShowAddForm(false);
      setEditFormData({
        content: '',
        target_date: '',
        notes: ''
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while saving the vision');
      }
    }
  }

  async function handleBhagSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vision) return;

    try {
      const { error } = await supabase
        .from('bhags')
        .insert([{ 
          content: editFormData.content,
          target_date: editFormData.target_date,
          notes: editFormData.notes,
          vision_id: vision.id
        }]);

      if (error) throw error;

      fetchAllData();
      setShowAddForm(false);
      setEditFormData({
        content: '',
        target_date: '',
        notes: ''
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while saving the BHAG');
      }
    }
  }

  async function handleMilestoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBhagId) return;

    try {
      const { error } = await supabase
        .from('milestones')
        .insert([{ 
          content: newMilestone.content,
          target_date: newMilestone.target_date,
          notes: newMilestone.notes,
          bhag_id: selectedBhagId
        }]);

      if (error) throw error;

      fetchAllData();
      setShowMilestoneForm(false);
      setSelectedBhagId(null);
      setNewMilestone({
        content: '',
        target_date: '',
        notes: ''
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while saving the milestone');
      }
    }
  }

  async function handleEditVision(e: React.FormEvent) {
    e.preventDefault();
    if (!vision) return;

    try {
      const { error } = await supabase
        .from('north_star_vision')
        .update(editFormData)
        .eq('id', vision.id);

      if (error) throw error;

      fetchAllData();
      setEditingVision(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the vision');
      }
    }
  }

  async function handleEditBhag(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBhagId) return;

    try {
      const { error } = await supabase
        .from('bhags')
        .update(editFormData)
        .eq('id', editingBhagId);

      if (error) throw error;

      fetchAllData();
      setEditingBhagId(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the BHAG');
      }
    }
  }

  async function handleEditMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMilestoneId) return;

    try {
      const { error } = await supabase
        .from('milestones')
        .update(editFormData)
        .eq('id', editingMilestoneId);

      if (error) throw error;

      fetchAllData();
      setEditingMilestoneId(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the milestone');
      }
    }
  }

  function startEditing(type: 'vision' | 'bhag' | 'milestone', item: NorthStarVision | BHAG | Milestone) {
    setEditFormData({
      content: item.content,
      target_date: item.target_date || '',
      notes: item.notes || ''
    });

    if (type === 'vision') {
      setEditingVision(true);
    } else if (type === 'bhag') {
      setEditingBhagId((item as BHAG).id);
    } else {
      setEditingMilestoneId((item as Milestone).id);
    }
  }

  function renderEditForm(type: 'vision' | 'bhag' | 'milestone') {
    const handleSubmit = type === 'vision' 
      ? handleEditVision 
      : type === 'bhag' 
        ? handleEditBhag 
        : handleEditMilestone;

    const handleCancel = () => {
      if (type === 'vision') setEditingVision(false);
      else if (type === 'bhag') setEditingBhagId(null);
      else setEditingMilestoneId(null);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === 'vision' ? 'North Star Vision' : type === 'bhag' ? 'BHAG' : 'Milestone'}
            </label>
            <textarea
              required
              value={editFormData.content}
              onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={editFormData.target_date}
              onChange={(e) => setEditFormData({ ...editFormData, target_date: e.target.value })}
              className="w-full border rounded px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
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
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderForm() {
    const isVisionForm = formType === 'vision';
    const formData = isVisionForm ? editFormData : editFormData;
    const setFormData = isVisionForm ? setEditFormData : setEditFormData;
    const handleSubmit = isVisionForm ? handleVisionSubmit : handleBhagSubmit;

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

  function renderTimeline() {
    const items = getTimelineItems();
    if (items.length === 0) return null;

    const positionedItems = calculateTimelinePositions(items);
    const minSpaceBetweenItems = 10;

    const today = new Date();
    const firstDate = new Date(items[0].target_date!);
    const lastDate = new Date(items[items.length - 1].target_date!);
    const timeRange = lastDate.getTime() - firstDate.getTime();

    // Generate month/year markers
    const months: { date: Date; position: number }[] = [];
    let currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      const position = 15 + ((currentDate.getTime() - firstDate.getTime()) / timeRange) * 80;
      months.push({
        date: new Date(currentDate),
        position
      });
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }

    return (
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Timeline</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTimelineZoom(prev => Math.max(50, prev - 10))}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{timelineZoom}%</span>
            <button
              onClick={() => setTimelineZoom(prev => Math.min(200, prev + 10))}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div
            className="relative cursor-grab active:cursor-grabbing"
            style={{ 
              minWidth: '800px', 
              width: `${timelineZoom}%`,
              height: '250px',
              transform: `translateX(${timelinePan}px)`,
              transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
            }}
            onWheel={(e: React.WheelEvent) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY * -0.5;
                setTimelineZoom(prev => Math.min(Math.max(50, prev + delta), 200));
              }
            }}
            onMouseDown={(e: React.MouseEvent) => {
              isDragging.current = true;
              lastDragX.current = e.clientX;
            }}
            onMouseMove={(e: React.MouseEvent) => {
              if (isDragging.current) {
                const delta = e.clientX - lastDragX.current;
                setTimelinePan(prev => prev + delta);
                lastDragX.current = e.clientX;
              }
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
            }}
          >
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Today marker */}
            {today >= firstDate && today <= lastDate && (
              <div 
                className="absolute top-0 bottom-0" 
                style={{ 
                  left: `${15 + ((today.getTime() - firstDate.getTime()) / timeRange) * 80}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="absolute top-6 w-0.5 h-full bg-red-500 opacity-20" />
                <div className="absolute top-4 -translate-x-1/2">
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Today
                  </div>
                </div>
                <div className="absolute top-8 -translate-x-1/2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0" />
                </div>
              </div>
            )}

            {/* Month/Year markers */}
            <div className="absolute bottom-0 left-0 right-0 h-8">
              {months.map((month, index) => (
                <div
                  key={month.date.toISOString()}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${month.position}%` }}
                >
                  <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {month.date.toLocaleDateString(undefined, {
                      month: 'short',
                      year: month.date.getMonth() === 0 || index === 0 ? 'numeric' : undefined
                    })}
                  </div>
                </div>
              ))}
            </div>

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
      </div>
    );
  }

  function getTimelineItems(): TimelineItem[] {
    const items: TimelineItem[] = [];
    
    if (vision) {
      items.push({
        id: vision.id,
        content: vision.content,
        target_date: vision.target_date || '',
        type: 'vision',
        position: 0, // Default position value
      });
    }

    bhags.forEach(bhag => {
      items.push({
        id: bhag.id,
        content: bhag.content,
        target_date: bhag.target_date || '',
        completed: bhag.completed,
        type: 'bhag',
        position: 0, // Default position value
      });
    });

    milestones.forEach(milestone => {
      items.push({
        id: milestone.id,
        content: milestone.content,
        target_date: milestone.target_date || '',
        completed: milestone.completed,
        type: 'milestone',
        position: 0, // Default position value
      });
    });

    return items;
  }

  function calculateTimelinePositions(items: TimelineItem[]): TimelineItem[] {
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

  function renderMilestones(bhagId: number) {
    const bhagMilestones = milestones.filter(m => m.bhag_id === bhagId);
    if (bhagMilestones.length === 0) return null;

    return (
      <div className="ml-8 mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones:</h4>
        {bhagMilestones.map((milestone) => (
          <div key={milestone.id}>
            {editingMilestoneId === milestone.id ? (
              renderEditForm('milestone')
            ) : (
              <div className="flex items-start gap-2 text-sm">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{milestone.notes}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEditing('milestone', milestone)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  async function deleteBhag(id: number) {
    try {
      const { error } = await supabase
        .from('bhags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchAllData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while deleting the BHAG');
      }
    }
  }

  async function toggleMilestoneComplete(milestone: Milestone, completed: boolean) {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ completed })
        .eq('id', milestone.id);

      if (error) throw error;

      fetchAllData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the milestone');
      }
    }
  }

  async function deleteMilestone(id: number) {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchAllData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while deleting the milestone');
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Goals</h1>

      {/* Vision Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">North Star Vision</h2>
          {!vision && !showAddForm && (
            <button
              onClick={() => {
                setShowAddForm(true);
                setFormType('vision');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Add Vision
            </button>
          )}
        </div>

        {vision && !editingVision && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-900 dark:text-white mb-4">{vision.content}</p>
            {vision.target_date && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Target: {new Date(vision.target_date).toLocaleDateString()}
              </p>
            )}
            {vision.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{vision.notes}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => startEditing('vision', vision)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {editingVision && renderEditForm('vision')}

        {/* BHAGs Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">BHAGs</h2>
            {vision && !showAddForm && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setFormType('bhag');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Add BHAG
              </button>
            )}
          </div>

          {bhags.map((bhag) => (
            <div key={bhag.id} className="mb-6">
              {editingBhagId === bhag.id ? (
                renderEditForm('bhag')
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <p className="text-gray-900 dark:text-white mb-4">{bhag.content}</p>
                  {bhag.target_date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Target: {new Date(bhag.target_date).toLocaleDateString()}
                    </p>
                  )}
                  {bhag.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{bhag.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing('bhag', bhag)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBhag(bhag.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowMilestoneForm(true);
                        setSelectedBhagId(bhag.id);
                      }}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Add Milestone
                    </button>
                  </div>
                  {/* Render milestones */}
                  {renderMilestones(bhag.id)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddForm && renderForm()}

      {showMilestoneForm && renderMilestoneForm()}

      {renderTimeline()}
    </div>
  );
}
