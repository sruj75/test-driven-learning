import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import type { Question } from '../../services/ai';

export async function POST(request: Request) {
  try {
    const { topic, concepts } = await request.json();
    
    if (!topic || !concepts || !Array.isArray(concepts)) {
      return NextResponse.json(
        { error: "Invalid input: topic and concepts array are required" },
        { status: 400 }
      );
    }
    
    // Request 2-3 questions, return a JSON array. No extra explanation.
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'Generate 2-3 assessment questions for the user. Output ONLY a JSON array of question objects.' },
        { role: 'user', content: `Topic: ${topic}\nConcepts: ${concepts.join(', ')}\nOutput JSON array:` }
      ],
      temperature: 0.7
    });
    
    let content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid response from LLM');
    }
    // Strip code fences/backticks
    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '').trim();
    }
    if (content.startsWith('`') && content.endsWith('`')) {
      content = content.slice(1, -1).trim();
    }
    let questions: Question[];
    try {
      const parsed = JSON.parse(content);
      questions = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
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