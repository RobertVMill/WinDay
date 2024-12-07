import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ai_context_templates')
      .select('base_prompt')
      .eq('name', 'base_personality')
      .single();

    if (error) {
      console.error('Error fetching base personality:', error);
      return NextResponse.json(
        { error: 'Failed to fetch base personality' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      basePersonality: data?.base_prompt || 'I am your personal AI assistant.',
    });
  } catch (error) {
    console.error('Error in personality API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch base personality' },
      { status: 500 }
    );
  }
}
