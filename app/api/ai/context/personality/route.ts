import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ai_context_templates')
      .select('base_prompt')
      .eq('name', 'base_personality')
      .single();

    if (error) throw error;

    return NextResponse.json({ personality: data.base_prompt });
  } catch (error) {
    console.error('Error fetching personality:', error);
    return NextResponse.json(
      { personality: 'I am your personal AI assistant.' },
      { status: 500 }
    );
  }
}