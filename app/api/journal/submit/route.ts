import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { journalEntry, scoreData } = body;

    // Start a transaction by using Promise.all
    const [journalResult, scoreResult] = await Promise.all([
      // Insert journal entry
      supabase
        .from('journal_entries')
        .insert([journalEntry])
        .select()
        .single(),

      // Insert daily score
      supabase
        .from('daily_scores')
        .insert([scoreData])
        .select()
        .single()
    ]);

    if (journalResult.error) throw journalResult.error;
    if (scoreResult.error) throw scoreResult.error;

    return NextResponse.json({ 
      success: true, 
      data: {
        journalEntry: journalResult.data,
        scoreData: scoreResult.data
      }
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit entry' 
      },
      { status: 500 }
    );
  }
} 