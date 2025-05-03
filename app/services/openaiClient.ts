import OpenAI from 'openai';

// Shared Groq-compatible OpenAI client
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: GROQ_API_KEY,
});

// LLM model constant for all API routes
export const MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct";

export default client; 