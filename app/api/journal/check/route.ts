import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Database check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
} 