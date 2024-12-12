'use client';

import { useEffect, useState, useCallback } from 'react';
import WeeklySchedule, { ScheduleBlock } from '../components/WeeklySchedule';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function CalendarPage() {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const supabase = getSupabaseBrowser();

  const fetchScheduleBlocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*');

      if (error) throw error;
      if (data) {
        // Transform the data to match the ScheduleBlock interface
        const transformedBlocks = data.map(block => ({
          ...block,
          completed: false,
          day_type: 'normal',
          notes: block.notes || undefined, // Convert null to undefined
          focus_taps: 0,
        }));
        setScheduleBlocks(transformedBlocks);
      }
    } catch (err) {
      console.error('Error fetching schedule blocks:', err);
    }
  }, [supabase, setScheduleBlocks]);

  useEffect(() => {
    fetchScheduleBlocks();
  }, [fetchScheduleBlocks]);

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <WeeklySchedule 
        scheduleBlocks={scheduleBlocks} 
        onBlocksUpdate={setScheduleBlocks}
      />
    </main>
  );
}
