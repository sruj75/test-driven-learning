import { NextResponse } from 'next/server';
import client, { MODEL_NAME } from '../../services/openaiClient';
import { cleanLLMOutput } from '../../lib/llmUtils';

export async function POST(req: Request) {
  try {
    const { question, answer, context } = await req.json();
    if (!question || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Invalid input: question and answer are required' }, { status: 400 });
    }

    // New system prompt focused on identifying knowledge gaps
    const systemPrompt = `ALWAYS use simple English suitable for a 10-year-old child. Use short words, short sentences, and explain all concepts in the simplest possible way. Avoid technical jargon unless absolutely necessary, and when you must use it, define it immediately in plain language.

You are a knowledge gap analyzer for personalized learning. Your goal is NOT to judge answers as right or wrong, but to identify specific gaps in understanding.

For each answer, analyze:
1. What concepts the learner understands correctly
2. What specific knowledge gaps or misconceptions exist
3. How complete their understanding is (as a percentage)
4. What targeted resources would help address those gaps

YOUR RESPONSE MUST BE VALID JSON with this exact format:
{
  "understandingScore": number, // 0-100 representing completeness of understanding
  "identifiedGaps": ["specific gap 1", "specific gap 2", ...], // Array of knowledge gaps
  "feedback": "conversational feedback with questions", // Insightful feedback
  "nextSteps": "specific recommendation", // What to focus on next
  "readyToProgress": boolean // Whether they can move to the next topic
}

The "understandingScore" should reflect how complete their understanding is.
The "identifiedGaps" should list specific concepts that need clarification.
The "feedback" should be conversational and kid-friendly - as if talking to a 10-year-old.
The "nextSteps" should give clear direction on what to study next.
Set "readyToProgress" to true when understanding is sufficient (70%+ score with no critical gaps).`;

    const userPrompt = `Question: ${question}\nContext: ${context || ''}\nAnswer: ${answer}\n\nAnalyze this answer to identify knowledge gaps. Respond with ONLY valid JSON in the required format.`;

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" }, // Use OpenAI's JSON response format if available
      temperature: 0.2,
      max_tokens: 500,
    });

    const raw = cleanLLMOutput(response.choices?.[0]?.message?.content || '');
    let parsed;
    try {
      parsed = JSON.parse(raw);
      
      // Validate the parsed result has the expected format
      if (
        typeof parsed.understandingScore !== 'number' || 
        !Array.isArray(parsed.identifiedGaps) || 
        typeof parsed.feedback !== 'string' ||
        typeof parsed.nextSteps !== 'string' ||
        typeof parsed.readyToProgress !== 'boolean'
      ) {
        throw new Error('JSON response missing required fields');
      }
    } catch (error) {
      console.error('Measure API JSON parse error:', error);
      console.error('Raw LLM response:', response.choices?.[0]?.message?.content);
      console.error('Cleaned output:', raw);
      
      // Create a fallback response
      parsed = {
        understandingScore: 0,
        identifiedGaps: ["Unable to process your answer"],
        feedback: "I couldn't analyze your answer properly. Could you try explaining in a different way?",
        nextSteps: "Please review the main concepts and try again with a clearer response",
        readyToProgress: false
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Measure API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 