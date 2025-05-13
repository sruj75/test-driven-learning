import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import type { ChatCompletionMessageParam } from 'openai/resources';

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json() as { conversation: { role: string; content: string }[] };
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json({ error: 'Invalid input: conversation array is required' }, { status: 400 });
    }
    
    // System prompt guides the LLM to have a natural conversation that uncovers user needs
    const messages = [
      {
        role: 'system',
        content: `You're having a casual, human-like conversation to understand the user's learning goals. 
Act like a friendly, curious person - NOT an AI. Keep responses short (1-3 sentences) and conversational.

Your goal is to uncover:
1. WHAT they want to learn (specific skills, technologies)
2. WHY they're learning it (job, personal project, etc.)
3. THEIR TIMELINE expectations (how quickly they need to learn)
4. HOW DEEP they want to go (basics vs mastery)
5. PRIOR KNOWLEDGE they already have
6. PRACTICAL APPLICATIONS they care about

Ask follow-up questions naturally like a human would. Be brief. Don't use phrases like "I understand" or "That's great!" repeatedly. 
Never summarize the conversation.

Just like the "Mom Test" in customer research, ask questions that uncover real needs without leading answers.
Avoid questions that can be answered yes/no. Instead ask "what," "how," and "why" questions.

This will help create a truly personalized learning path once you have enough information.`
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