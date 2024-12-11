import OpenAI from 'openai';
import type { AIContext } from '@/app/services/ai-context';
import { supabase } from '@/app/utils/db';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', // Allow empty string during build
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
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      message: completion.choices[0].message,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Handle rate limit errors specifically
    if (error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}