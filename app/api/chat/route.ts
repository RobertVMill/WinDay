import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { AIContext } from '@/app/services/ai-context';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createSystemMessage(context: AIContext): string {
  let systemPrompt = context.basePersonality;

  // Add relevant quotes if available
  if (context.relevantQuotes.length > 0) {
    systemPrompt += '\n\nRelevant Quotes:\n';
    context.relevantQuotes.forEach(quote => {
      systemPrompt += `- "${quote.content}" (${quote.source || 'Personal Collection'})\n`;
    });
  }

  // Add relevant goals if available
  if (context.relevantGoals.length > 0) {
    systemPrompt += '\n\nCurrent Goals:\n';
    context.relevantGoals.forEach(goal => {
      if (goal.content) {
        systemPrompt += `- ${goal.content}\n`;
      }
    });
  }

  // Add conversation-specific context
  switch (context.conversationType) {
    case 'goal_setting':
      systemPrompt += '\n\nFocus on helping achieve goals through the four empires framework. Reference the 100 subscribers milestone when relevant.';
      break;
    case 'workout_planning':
      systemPrompt += '\n\nProvide guidance on training that balances intensity with recovery. Consider the CEOlympian mindset.';
      break;
    case 'reflection':
      systemPrompt += '\n\nHelp extract insights and patterns from experiences. Connect observations to the four empires.';
      break;
  }

  return systemPrompt;
}

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: createSystemMessage(context)
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