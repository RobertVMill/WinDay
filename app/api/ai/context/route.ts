import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/db';

export async function POST(request: Request) {
  try {
    const { conversationType, currentPath } = await request.json();

    // Get base personality
    const { data: personalityData, error: personalityError } = await supabase
      .from('ai_context_templates')
      .select('base_prompt')
      .eq('name', 'base_personality')
      .single();

    if (personalityError) throw personalityError;

    // Get relevant goals
    const { data: goalsData, error: goalsError } = await supabase
      .from('empire_goals')
      .select('*')
      .limit(5);

    if (goalsError) throw goalsError;

    // Get relevant quotes
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(3);

    if (quotesError) throw quotesError;

    // Get relevant journal entries
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (journalError) throw journalError;

    return NextResponse.json({
      basePersonality: personalityData.base_prompt,
      relevantGoals: goalsData,
      relevantQuotes: quotesData,
      relevantJournalEntries: journalData,
      conversationType,
    });
  } catch (error) {
    console.error('Error in context API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}
