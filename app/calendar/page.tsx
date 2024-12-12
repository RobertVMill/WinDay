'use client';

import { useEffect, useState } from 'react';
import WeeklySchedule from '../components/WeeklySchedule';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type ScheduleBlock = Database['public']['Tables']['schedule_blocks']['Row'];

export default function CalendarPage() {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    fetchScheduleBlocks();
  }, []);

  const fetchScheduleBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*');

      if (error) throw error;
      if (data) setScheduleBlocks(data);
    } catch (err) {
      console.error('Error fetching schedule blocks:', err);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <WeeklySchedule 
        scheduleBlocks={scheduleBlocks} 
        onBlocksUpdate={setScheduleBlocks}
      />
    </main>
  );
}
