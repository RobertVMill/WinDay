import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const createSystemPrompt = async (goalsContext: any) => {
  let contextPrompt = `You are Bert's personal AI assistant, deeply familiar with his philosophy and way of thinking. You embody the spirit of the CEOlympian - the unique combination of a visionary CEO and an Olympian athlete. Your role is to:

1. Help users clarify their goals and break them down into actionable steps
2. Suggest daily and weekly schedules that align with their goals
3. Balance activities across different life areas (work, health, relationships, personal growth)
4. Provide motivation and accountability
5. Offer practical tips for time management and productivity
6. Incorporate Bert's wisdom and quotes when relevant to provide guidance

North Star Vision:
Increase the pace of development of our four empires (Mind, Body, Heart, and Gut) and lead others to do the same. Each empire represents a crucial aspect of holistic growth and development:
- Mind: Mental and intellectual growth
- Body: Physical health and wellbeing
- Heart: Emotional intelligence and relationships
- Gut: Intuition and core decision-making

Personal Mission:
"Bert, you are the only one who can become the CEOlympian, that is your purpose to achieve."

Key Milestone:
- Target: 100 Subscribers on AI News Platform by April 29th, 2025 (Current: 0/100)
- Mission: Building the definitive platform for discovering and mastering the latest AI tools, helping businesses stay at the cutting edge of innovation.

This milestone is a top priority and should be considered when making any scheduling or planning suggestions.`;

  // Fetch random quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .limit(5);
    
  if (quotes && quotes.length > 0) {
    contextPrompt += '\n\nBert\'s Wisdom (Selected Quotes):';
    quotes.forEach((quote: any) => {
      contextPrompt += `\n- "${quote.quote}" (${quote.title || 'General'})`;
    });
  }

  if (goalsContext?.vision) {
    contextPrompt += `\n\nAdditional North Star Vision: ${goalsContext.vision.content}`;
    if (goalsContext.vision.notes) {
      contextPrompt += `\nVision Notes: ${goalsContext.vision.notes}`;
    }
  }

  if (goalsContext?.empireGoals?.length > 0) {
    contextPrompt += '\n\nEmpire Goals:';
    goalsContext.empireGoals.forEach((goal: any) => {
      contextPrompt += `\n- ${goal.empire}: ${goal.content}${goal.target_date ? ` (Target: ${goal.target_date})` : ''}`;
    });
  }

  if (goalsContext?.dailyActions?.length > 0) {
    contextPrompt += '\n\nDaily Actions:';
    goalsContext.dailyActions.forEach((action: any) => {
      contextPrompt += `\n- ${action.empire}: ${action.action}`;
    });
  }

  return `${contextPrompt}\n\nKeep your responses concise, practical, and encouraging. Always consider the user's goals, vision, and especially the 100 subscribers milestone when making scheduling suggestions. Prioritize activities that will help reach the subscriber goal by April 29th, 2025.`;
};

export async function POST(req: Request) {
  // Debug logs
  console.log('OpenAI API Key exists:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
  console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  try {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages, goalsContext } = await req.json();
    console.log('Received messages:', messages.length);

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    // Simple non-streaming response first for debugging
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: await createSystemPrompt(goalsContext) 
        },
        ...messages
      ],
      temperature: 0.7,
    });

    return new Response(JSON.stringify(completion.choices[0].message), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}