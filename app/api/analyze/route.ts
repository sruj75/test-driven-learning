import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import type { Question } from '../../services/ai';

// Using shared Groq-compatible OpenAI client and model

export async function POST(request: Request) {
  try {
    const { topic, questions, answers } = await request.json() as { topic: string; questions: Question[]; answers: Record<string, string> };
    
    if (!topic || !questions || !answers) {
      return NextResponse.json(
        { error: "Invalid input: topic, questions, and answers are required" },
        { status: 400 }
      );
    }
    
    // Format questions and answers for the prompt
    const questionsAndAnswers = questions.map((q: Question) => {
      return `Question: ${q.question}\nAnswer: ${answers[q.id] || "No answer provided"}`;
    }).join("\n\n");
    
    // Ask LLM for a raw JSON array of gap strings
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'Provide a JSON array of knowledge gap strings based on the following Q&A. No additional explanation.'
        },
        {
          role: 'user',
          content: `Questions and Answers:\n\n${questionsAndAnswers}\n\nReturn ONLY the JSON array.`
        }
      ],
      temperature: 0.0
    });
    
    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid LLM response for gap analysis');
    }
    // Clean up content: remove triple backticks or single backticks/code fences
    let text = content.trim();
    // Remove ```json or ``` fenced code blocks
    if (text.startsWith('```')) {
      text = text
        .replace(/^```[\s\S]*?\n/, '')  // remove opening ``` and optional language
        .replace(/```$/, '').trim();       // remove closing ```
    }
    // Remove single backticks around JSON
    if (text.startsWith('`') && text.endsWith('`')) {
      text = text.slice(1, -1).trim();
    }
    let gaps: string[];
    try {
      const parsed = JSON.parse(text);
      gaps = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Raw gap content:', text);
      throw new Error(`Failed to parse gaps JSON: ${e}`);
    }
    
    return NextResponse.json({ gaps });
  } catch (error: unknown) {
    console.error("Error analyzing gaps:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage || "Failed to analyze knowledge gaps" },
      { status: 500 }
    );
  }
} 