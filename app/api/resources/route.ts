import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';

export async function POST(request: Request) {
  try {
    const { gaps, context } = await request.json() as { gaps: string[]; context?: string };
    
    if (!gaps || !Array.isArray(gaps)) {
      return NextResponse.json(
        { error: "Invalid input: gaps array is required" },
        { status: 400 }
      );
    }

    const resources: { topic: string; videos: { id: string; title: string; url: string; }[]; explanation: string; completed: boolean; }[] = [];
    
    for (const gap of gaps) {
      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "ALWAYS use simple English as if teaching a 10-year-old child. Use short words, short sentences, and explain all concepts in the simplest possible way. Avoid technical jargon unless absolutely necessary, and when you must use it, define it immediately in plain language a child would understand. You are a concise educational AI that creates focused learning resources using bullet points and minimal text. Format content for quick consumption, similar to effective marketing copy. Prioritize clarity and directness over comprehensive explanations."
          },
          {
            role: "user",
            content: `Create a quick-scan learning resource for the concept "${gap}" that a user can consume in under 60 seconds.
${context ? `Context: ${context}
` : ''}Follow these STRICT formatting rules:
  1. Start with 2-3 bullet points of key facts/definitions (1 sentence each)
  2. Include 1 very brief code example or demonstration (if applicable)
  3. Add 2-3 bullet points with practical applications or tips
  4. End with 1-2 common misconceptions as bullet points

  Use this structure:
  * Key point 1
  * Key point 2

  Example:
  [brief example or code snippet]

  * Practical tip 1
  * Practical tip 2

  * Common mistake: [misconception]`
          }
        ],
        temperature: 0.5,
        max_tokens: 400 // Limit token count to enforce brevity
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }
      
      // Create mock video resources for reference (could be replaced with real API)
      const mockVideos = [
        {
          id: `${gap.replace(/\s+/g, '-').toLowerCase()}-1`,
          title: `Quick Guide to ${gap}`,
          url: `https://example.com/learn/${gap.replace(/\s+/g, '-').toLowerCase()}`
        }
      ];
      
      resources.push({
        topic: gap,
        videos: mockVideos,
        explanation: content,
        completed: false
      });
    }
    
    return NextResponse.json({ resources });
  } catch (error: unknown) {
    console.error("Error generating resources:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage || "Failed to generate learning resources" },
      { status: 500 }
    );
  }
} 