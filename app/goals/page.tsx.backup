'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

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
  empire: string;
}

interface TimelineItem {
  id: number;
  content: string;
  target_date: string;
  completed?: boolean;
  type: 'vision' | 'bhag' | 'milestone';
  position: number;
}

interface MilestoneCompletion {
  id: number;
  empire: 'body' | 'mind' | 'heart' | 'gut';
  milestone_name: string;
  completed_at: string;
  notes?: string;
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

  const [currentSubscribers, setCurrentSubscribers] = useState(0);
  const [bodyProgress, setBodyProgress] = useState(0);
  const [mindProgress, setMindProgress] = useState(0);
  const [heartProgress, setHeartProgress] = useState(0);
  const [gutProgress, setGutProgress] = useState(0);

  const [milestoneCompletions, setMilestoneCompletions] = useState<MilestoneCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
    fetchProgress();
    fetchMilestoneCompletions();
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

  async function fetchProgress() {
    // Fetch subscribers count
    const { data: subscribersData } = await supabase
      .from('subscribers')
      .select('count')
      .single();
    
    if (subscribersData) {
      setCurrentSubscribers(subscribersData.count);
    }

    // Calculate body progress
    const { data: bodyData } = await supabase
      .from('body_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bodyData) {
      const powerCleanProgress = (bodyData.power_clean / 275) * 100;
      const benchProgress = (bodyData.bench_press / 225) * 100;
      const runningProgress = bodyData.running_time ? (60 / bodyData.running_time) * 100 : 0;
      setBodyProgress((powerCleanProgress + benchProgress + runningProgress) / 3);
    }

    // Calculate heart progress (birthday wishes)
    const { data: heartData } = await supabase
      .from('birthday_wishes')
      .select('count')
      .single();

    if (heartData) {
      setHeartProgress((heartData.count / 100) * 100);
    }

    // Calculate mind progress (books read)
    const { data: mindData } = await supabase
      .from('books_read')
      .select('count')
      .single();

    if (mindData) {
      setMindProgress((mindData.count / 10) * 100);
    }

    // Calculate gut progress (based on diet tracking)
    const { data: gutData } = await supabase
      .from('diet_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (gutData) {
      const fiberProgress = (gutData.fiber_intake / gutData.fiber_goal) * 100;
      const cleanDietProgress = (gutData.clean_eating_days / 7) * 100;
      setGutProgress((fiberProgress + cleanDietProgress) / 2);
    }
  }

  async function fetchMilestoneCompletions() {
    const { data, error } = await supabase
      .from('milestone_completions')
      .select('*')
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching milestone completions:', error);
      return;
    }
    
    setMilestoneCompletions(data);
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

  async function handleMilestoneComplete(empire: string, milestoneName: string, completed: boolean) {
    try {
      if (completed) {
        // Add completion record
        const { error: insertError } = await supabase
          .from('milestone_completions')
          .insert({
            empire,
            milestone_name: milestoneName,
            completed_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        // Remove completion record
        const { error: deleteError } = await supabase
          .from('milestone_completions')
          .delete()
          .eq('empire', empire)
          .eq('milestone_name', milestoneName);

        if (deleteError) throw deleteError;
      }

      // Refresh the milestone completions data
      fetchMilestoneCompletions();
      
      // Update progress
      await fetchProgress();
    } catch (error: any) {
      console.error('Error updating milestone completion:', error.message);
    }
  }

  async function toggleMilestoneComplete(milestone: Milestone, completed: boolean) {
    try {
      // Debug: Check if we have auth context
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      if (completed) {
        // Debug: Log the data we're trying to insert
        const insertData = {
          empire: milestone.empire,
          milestone_name: milestone.content,
          completed_at: new Date().toISOString(),
          user_id: user?.id // Explicitly set user_id
        };
        console.log('Inserting milestone completion:', insertData);

        const { error: insertError } = await supabase
          .from('milestone_completions')
          .insert(insertData);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      } else {
        // Debug: Log delete operation
        console.log('Deleting milestone completion:', {
          milestone_name: milestone.content,
          empire: milestone.empire,
          user_id: user?.id
        });

        const { error: deleteError } = await supabase
          .from('milestone_completions')
          .delete()
          .eq('milestone_name', milestone.content)
          .eq('empire', milestone.empire)
          .eq('user_id', user?.id);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }
      }

      fetchAllData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Operation error:', error);
        setError(error.message);
      } else {
        setError('An error occurred while updating the milestone completion');
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
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
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
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
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
      <form onSubmit={handleMilestoneSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
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

  function renderVisionDetails() {
    if (!selectedDate) return null;

    const date = new Date(selectedDate);
    const isTargetDate = date.toLocaleDateString() === new Date('2025-04-29').toLocaleDateString();

    if (isTargetDate) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4 relative">
            <button 
              onClick={() => setSelectedDate(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Vision Achievement</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-2">North Star Vision</h3>
                <p className="text-white">{vision?.content}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-2">BHAGs Achieved</h3>
                <ul className="space-y-2">
                  {bhags.map(bhag => (
                    <li key={bhag.id} className="flex items-center gap-2 text-white">
                      <span className={`w-2 h-2 rounded-full ${bhag.completed ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      {bhag.content}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-indigo-400 mb-2">Milestone Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['body', 'mind', 'heart', 'gut'].map(empire => (
                    <div key={empire} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-white capitalize mb-2">{empire} Empire</h4>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            empire === 'body' ? 'bg-green-400' :
                            empire === 'mind' ? 'bg-yellow-400' :
                            empire === 'heart' ? 'bg-red-400' :
                            'bg-indigo-400'
                          }`}
                          style={{ 
                            width: `${
                              empire === 'body' ? bodyProgress :
                              empire === 'mind' ? mindProgress :
                              empire === 'heart' ? heartProgress :
                              gutProgress
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
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
                    className="absolute transform -translate-x-1/2"
                    style={{ left: `${adjustedPosition}%` }}
                    onMouseEnter={() => setExpandedItem(item.id)}
                    onMouseLeave={() => setExpandedItem(null)}
                  >
                    {/* Timeline dot */}
                    <div 
                      className={`w-4 h-4 rounded-full border-2 cursor-pointer
                        ${item.completed 
                          ? 'bg-green-500 border-green-600 dark:bg-green-400 dark:border-green-500' 
                          : item.type === 'vision'
                            ? 'bg-purple-500 border-purple-600 dark:bg-purple-400 dark:border-purple-500'
                            : item.type === 'bhag'
                              ? 'bg-blue-500 border-blue-600 dark:bg-blue-400 dark:border-blue-500'
                              : 'bg-indigo-500 border-indigo-600 dark:bg-indigo-400 dark:border-indigo-500'}`}
                      onClick={() => {
                        setExpandedItem(expandedItem === item.id ? null : item.id);
                        if (new Date(item.target_date).toLocaleDateString() === new Date('2025-04-29').toLocaleDateString()) {
                          setSelectedDate(item.target_date);
                        }
                      }}
                    ></div>

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
                      className={`absolute top-16 -translate-x-1/2 w-64 transition-all duration-200 ease-in-out z-10
                        ${expandedItem === item.id 
                          ? 'opacity-100 translate-y-0 pointer-events-auto' 
                          : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                    >
                      <div className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="font-medium text-white mb-2">{item.content}</h3>
                        <p className="text-sm text-gray-300">
                          Target: {new Date(item.target_date!).toLocaleDateString()}
                        </p>
                        {item.type === 'milestone' && (
                          <div className="mt-3">
                            <label className="flex items-center gap-2 text-sm text-gray-300">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => {
                                  const milestone = milestones.find(m => m.id === item.id);
                                  if (milestone) {
                                    toggleMilestoneComplete(milestone, e.target.checked);
                                  }
                                }}
                                className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                              />
                              Mark as complete
                            </label>
                          </div>
                        )}
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
      // Check if this milestone has a completion record
      const completion = milestoneCompletions.find(
        mc => mc.milestone_name === milestone.content && mc.empire === milestone.empire
      );

      items.push({
        id: milestone.id,
        content: milestone.content,
        target_date: milestone.target_date || '',
        completed: !!completion,
        type: 'milestone',
        position: 0,
      });
    });

    // Add milestone completions to the timeline
    milestoneCompletions.forEach(completion => {
      items.push({
        id: completion.id,
        content: completion.milestone_name,
        target_date: completion.completed_at,
        completed: true,
        type: 'milestone',
        position: 0,
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

  function getEmpireColor(empire: string): string {
    switch (empire) {
      case 'body':
        return 'bg-purple-500';
      case 'mind':
        return 'bg-yellow-500';
      case 'heart':
        return 'bg-red-500';
      case 'gut':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  }

  function renderEmpireMilestones(empire: string, milestones: string[]) {
    return (
      <div className="space-y-3">
        {milestones.map((milestone) => {
          const completion = milestoneCompletions.find(
            mc => mc.empire === empire && mc.milestone_name === milestone
          );
          
          return (
            <label key={milestone} className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                className="form-checkbox h-5 w-5"
                checked={!!completion}
                onChange={(e) => handleMilestoneComplete(empire, milestone, e.target.checked)}
              />
              <span className={completion ? 'line-through text-gray-400' : ''}>
                {milestone}
              </span>
              {completion && (
                <span className="text-xs text-gray-400">
                  {new Date(completion.completed_at).toLocaleDateString()}
                </span>
              )}
            </label>
          );
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {renderVisionDetails()}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Goals</h1>

      {/* Berto Mill Life Ethos */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 mb-6 text-white shadow-xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-1">Berto Mill Life Ethos</h2>
          <p className="text-sm opacity-90">
            Compound growth across Body, Mind, Heart, and Gut empires at an exponential pace, 
            inspiring others to unlock their full potential through the power of the four empires.
          </p>
        </div>
      </div>

      {/* Current Milestone Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-12 text-white shadow-xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">The Next Milestone</h2>
          <div className="mb-8 text-center">
            <p className="text-2xl font-semibold mb-2">
              100 Subscribers on AI News Platform
            </p>
            <div className="w-full bg-white/20 rounded-full h-4 mb-2">
              <div 
                className="bg-white rounded-full h-4 transition-all duration-500"
                style={{ width: `${(currentSubscribers / 100) * 100}%` }}
              ></div>
            </div>
            <p className="text-lg font-medium mb-4">
              {currentSubscribers} / 100 Subscribers
            </p>
            <p className="text-lg opacity-90 mb-8">
              Building the definitive platform for discovering and mastering the latest AI tools,
              helping businesses stay at the cutting edge of innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Mind Empire</h3>
                  <div className="h-1 w-16 bg-yellow-300 rounded-full"
                    style={{ width: `${mindProgress}%` }}></div>
                </div>
                <div className="space-y-3">
                  {renderEmpireMilestones('mind', [
                    '10 Books by April 29th',
                    '10 AI Apps on LinkedIn',
                  ])}
                  <div className="mt-4 text-sm opacity-75">
                    <p className="font-medium mb-2">Daily Actions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Deep reading session</li>
                      <li>Build in public</li>
                      <li>Document learnings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Body Empire</h3>
                  <div className="h-1 w-16 bg-purple-300 rounded-full"
                    style={{ width: `${bodyProgress}%` }}></div>
                </div>
                <div className="space-y-3">
                  {renderEmpireMilestones('body', [
                    'Power Clean: 275 lbs',
                    'Bench Press: 225 lbs x 10',
                    '20K Run: Under 1 hour',
                  ])}
                  <div className="mt-4 text-sm opacity-75">
                    <p className="font-medium mb-2">Daily Actions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Morning compound lifts</li>
                      <li>Evening cardio session</li>
                      <li>Track macros and recovery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Heart Empire</h3>
                  <div className="h-1 w-16 bg-red-300 rounded-full"
                    style={{ width: `${heartProgress}%` }}></div>
                </div>
                <div className="space-y-3">
                  {renderEmpireMilestones('heart', [
                    '100 Birthday Wishes (2024)',
                    '150 Birthday Wishes (2025)',
                  ])}
                  <div className="mt-4 text-sm opacity-75">
                    <p className="font-medium mb-2">Daily Actions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Genuine connections</li>
                      <li>Give value first</li>
                      <li>Follow up consistently</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Gut Empire</h3>
                  <div className="h-1 w-16 bg-indigo-300 rounded-full"
                    style={{ width: `${gutProgress}%` }}></div>
                </div>
                <div className="space-y-3">
                  {renderEmpireMilestones('gut', [
                    'Never Sick',
                    'Never Fatigued',
                    'Super Jawline',
                  ])}
                  <div className="mt-4 text-sm opacity-75">
                    <p className="font-medium mb-2">Daily Actions:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Track microbiome health</li>
                      <li>Clean eating protocol</li>
                      <li>Optimize sleep quality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Page Button */}
      <div className="mt-12 mb-8 flex justify-center">
        <Link 
          href="/journal"
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity"></span>
          <span className="absolute bottom-0 w-0 h-1 bg-white transition-all duration-200 ease-out group-hover:w-full"></span>
          <span className="relative flex items-center">
            Next: Journal
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform duration-200 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>

      {showAddForm && renderForm()}
      {showMilestoneForm && renderMilestoneForm()}
      {renderTimeline()}
    </div>
  );
}
