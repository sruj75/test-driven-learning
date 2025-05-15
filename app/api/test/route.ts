import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import { cleanLLMOutput } from '../../lib/llmUtils';
import type { Question } from '../../services/ai';

// Simple message type for system/user prompts
interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { topic, concepts, context } = await request.json() as { topic: string; concepts: string[]; context?: string };
    
    if (!topic || !concepts || !Array.isArray(concepts)) {
      return NextResponse.json(
        { error: "Invalid input: topic and concepts array are required" },
        { status: 400 }
      );
    }
    
    // Build messages array for the AI call
    const messages: ChatMessage[] = [
      { role: 'system', content: `You are an assessment generator for young learners. ALWAYS write using simple English as if explaining to a 10-year-old child. Use short words, short sentences, and explain all concepts in the simplest possible way. Avoid technical jargon unless absolutely necessary, and when you must use it, define it immediately in plain language. Create exactly 2-3 clear questions about the user's current topic. Respond ONLY with a valid JSON array of objects: [{"id":"...","question":"...","type":"..."}, ...] and nothing else.` },
      { role: 'user', content: `Topic: ${topic}${context ? `\nContext: ${context}` : ''}\nConcepts: ${concepts.join(', ')}\nOutput JSON array:` }
    ];

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.2
    });
    
    // Clean and parse JSON array of questions
    const raw = cleanLLMOutput(response.choices[0].message.content || '');
    let questions: Question[];
    try {
      const parsed = JSON.parse(raw);
      questions = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse questions JSON:', e, 'raw:', raw);
      throw new Error(`Failed to parse questions JSON: ${e}`);
    }
    
    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Error generating test questions:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage || "Failed to generate test questions" },
      { status: 500 }
    );
  }
} 