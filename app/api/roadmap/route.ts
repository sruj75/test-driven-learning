import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json();
    
    // Use full conversation; initial goal is first user message
    const initialGoal = conversation[0] || "learning programming";
    
    // Build LLM messages: include system prompt, entire conversation, then roadmap request
    const messages = [
      {
        role: "system",
        content: `You are an AI learning path specialist. Based on the user's above conversation, create a customized, domain-specific learning roadmap that directly addresses their goal "${initialGoal}".
Focus each step title and concepts on the user's topic, avoid generic placeholders.`
      },
      // Include full user conversation for context
      ...conversation.map((content: string) => ({ role: "user", content })),
      {
        role: "user",
        content: `Now, create a personalized learning roadmap:

1. Include 3-5 clear steps specific to "${initialGoal}".
2. Provide time estimates for each step.
3. List core concepts to master in each step.
4. Ensure progression reflects dependencies between concepts.

Return JSON:
{
  "roadmap": [
    { "stepNumber": 1, "title": "Step Title", "concepts": ["Concept1","Concept2"], "estimatedDays": number }
  ],
  "totalEstimatedDays": number
}`
      }
    ];
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (content === undefined || content === null) {
      throw new Error("Empty response from LLM");
    }
    
    // Content may already be an object (json_object) or a string
    let parsedResult;
    if (typeof content === 'string') {
      parsedResult = JSON.parse(content);
    } else {
      parsedResult = content;
    }
    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Error generating roadmap:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage || "Failed to generate roadmap" },
      { status: 500 }
    );
  }
} 