import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';

export async function POST(request: Request) {
  try {
    const { gaps } = await request.json() as { gaps: string[] };
    
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
            content: "You are an educational AI specializing in creating learning resources."
          },
          {
            role: "user",
            content: `Generate a comprehensive learning resource for the concept "${gap}".
            Include:
            1. A clear explanation in 2-3 paragraphs
            2. 2-3 practical examples
            3. Common misconceptions
            4. A brief practice exercise
            
            Format your response with markdown headings and structure.`
          }
        ],
        temperature: 0.7
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }
      
      resources.push({
        topic: gap,
        // Placeholder video data
        videos: [
          {
            id: `vid-${Date.now()}-${Math.round(Math.random() * 1000)}`,
            title: `Learn ${gap} - Placeholder (YouTube integration coming later)`,
            url: "#"
          }
        ],
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