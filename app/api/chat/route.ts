import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const systemPrompt = `You are a supportive AI assistant focused on helping users achieve their goals through effective scheduling and planning. Your role is to:

1. Help users clarify their goals and break them down into actionable steps
2. Suggest daily and weekly schedules that align with their goals
3. Balance activities across different life areas (work, health, relationships, personal growth)
4. Provide motivation and accountability
5. Offer practical tips for time management and productivity

Keep your responses concise, practical, and encouraging.`;

export async function POST(req: Request) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}