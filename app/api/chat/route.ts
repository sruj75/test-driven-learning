import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import type { ChatCompletionMessageParam } from 'openai/resources';

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json() as { conversation: { role: string; content: string }[] };
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: 'Invalid input: conversation array is required' }, { status: 400 });
    }
    
    // System prompt guides the LLM to ask clarifying questions
    const messages = [
      {
        role: 'system',
        content: 'You are an information gatherer. Chat with the user in a friendly, human-like style—like talking over coffee—to learn about their current skills, learning goals, and available time. Do NOT teach or suggest; just ask open-ended questions until you have what you need to build a personalized roadmap.'
      },
      ...conversation.map((msg) => ({ role: msg.role as ChatCompletionMessageParam['role'], content: msg.content })),
    ];

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: messages as unknown as ChatCompletionMessageParam[],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    if (!reply) {
      throw new Error('Empty reply from LLM');
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage || 'Failed to generate chat response' }, { status: 500 });
  }
} 