import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/db';

export async function POST(request: Request) {
  try {
    const { conversationType, _currentPath } = await request.json();

    // Get base personality
    const { data: personalityData, error: personalityError } = await supabase
      .from('ai_context_templates')
      .select('base_prompt')
      .eq('name', 'base_personality')
      .single();

    if (personalityError) {
      console.error('Error fetching personality:', personalityError);
      return NextResponse.json(
        { error: 'Failed to fetch personality data' },
        { status: 500 }
      );
    }

    // Get relevant goals
    const { data: goalsData, error: goalsError } = await supabase
      .from('empire_goals')
      .select('*')
      .limit(5);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return NextResponse.json(
        { error: 'Failed to fetch goals data' },
        { status: 500 }
      );
    }

    // Get relevant quotes
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(3);

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
      return NextResponse.json(
        { error: 'Failed to fetch quotes data' },
        { status: 500 }
      );
    }

    // Get relevant journal entries
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (journalError) {
      console.error('Error fetching journal entries:', journalError);
      return NextResponse.json(
        { error: 'Failed to fetch journal data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      basePersonality: personalityData?.base_prompt || 'I am your personal AI assistant.',
      relevantGoals: goalsData || [],
      relevantQuotes: quotesData || [],
      relevantJournalEntries: journalData || [],
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
