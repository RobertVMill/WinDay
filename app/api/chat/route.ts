import OpenAI from 'openai';
import type { AIContext } from '@/app/services/ai-context';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', // Allow empty string during build
});

function createSystemMessage(context: AIContext): string {
  // Set default base personality if not provided
  let systemPrompt = context?.basePersonality || 'You are a helpful AI assistant focused on personal development.';

  // Add relevant quotes if available
  if (context?.relevantQuotes?.length > 0) {
    systemPrompt += '\n\nRelevant Quotes:\n';
    context.relevantQuotes.forEach(quote => {
      systemPrompt += `- "${quote.content}" (${quote.source || 'Personal Collection'})\n`;
    });
  }

  // Add relevant goals if available
  if (context?.relevantGoals?.length > 0) {
    systemPrompt += '\n\nCurrent Goals:\n';
    context.relevantGoals.forEach(goal => {
      if (goal.content) {
        systemPrompt += `- ${goal.content}\n`;
      }
    });
  }

  // Add conversation-specific context
  switch (context?.conversationType) {
    case 'calendar':
      systemPrompt += '\n\nFocus on helping with calendar management, scheduling, and time optimization. Provide practical advice for planning and productivity.';
      break;
    case 'goal_setting':
      systemPrompt += '\n\nFocus on helping achieve goals through the four empires framework. Reference the 100 subscribers milestone when relevant.';
      break;
    case 'workout_planning':
      systemPrompt += '\n\nProvide guidance on training that balances intensity with recovery. Consider the CEOlympian mindset.';
      break;
    case 'reflection':
      systemPrompt += '\n\nHelp extract insights and patterns from experiences. Connect observations to the four empires.';
      break;
    default:
      systemPrompt += '\n\nProvide helpful and actionable advice while maintaining a focus on personal development.';
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

    const systemMessage = createSystemMessage(context);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: systemMessage },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat request' },
      { status: 500 }
    );
  }
}