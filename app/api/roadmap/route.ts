import { NextRequest, NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import { cleanLLMOutput } from '../../lib/llmUtils';

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();
    // Enhanced system prompt to utilize personalized data from conversation
    const systemPrompt = `
You are an expert curriculum designer who creates personalized learning paths.

TASK:
Analyze the user's conversation to identify their specific needs, including:
1. What they want to learn (topic, skills, technologies)
2. Their timeline expectations (how quickly they need to learn)
3. Their background and experience level
4. Their ultimate goal (job, project, etc.)
5. How in-depth they want to go

Then, generate a personalized JSON roadmap with milestones. Each milestone should have:
- A clear, specific "name" that shows progression
- An array of "topics" that build skills incrementally 
- Topics appropriate to their experience level and timeline
- Practical, applicable content aligned with their goals

FORMAT:
The output must be valid JSON only, with this structure:
{
  "milestones": [
    {
      "name": "Milestone Name That Shows Progression",
      "topics": ["Specific Topic 1", "Specific Topic 2", ...]
    },
    ...
  ]
}

GUIDELINES:
- For beginners: Include more fundamentals and smaller steps
- For experienced learners: Skip basics and focus on advanced topics
- For quick timelines: Streamline to essential, practical knowledge
- For in-depth learning: Include theoretical foundations
- For job seekers: Emphasize industry-relevant skills and projects
- For hobbyists: Focus on creative applications and quick wins

Return only valid JSON, no additional text.
`;

    // Build chat messages, including all user messages for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.map((msg: string) => ({ role: 'user', content: msg }))
    ];

    // Call the LLM with increased token count for more detailed roadmaps
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.7,
      max_tokens: 1200,
    });

    // Clean raw output
    const raw = cleanLLMOutput(response.choices?.[0]?.message?.content || '');

    let parsed;
    try {
      parsed = JSON.parse(raw || '{}');
    } catch (parseError) {
      console.error('Invalid JSON from LLM after cleaning:', parseError, 'raw:', raw);
      return NextResponse.json({ error: 'Invalid JSON from LLM', raw }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Roadmap API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 