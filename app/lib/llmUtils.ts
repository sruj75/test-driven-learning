// Utility to clean LLM-generated JSON strings
export function cleanLLMOutput(raw: string): string {
  if (!raw) return '{}';
  
  let cleaned = raw.trim();
  
  // Remove triple backticks with optional language specifier
  cleaned = cleaned.replace(/^```(?:json)?\s*/g, '').replace(/\s*```$/g, '');
  
  // Remove single backticks
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  
  // Check if the response contains JSON inside it (using [\s\S]* instead of .* with s flag for cross-line matching)
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Replace single quotes with double quotes for JSON properties
  cleaned = cleaned.replace(/'([^']+)':/g, '"$1":');
  
  // Ensure booleans are lowercase
  cleaned = cleaned.replace(/:\s*True/g, ': true');
  cleaned = cleaned.replace(/:\s*False/g, ': false');
  
  // Last resort fallback if we still don't have valid JSON
  try {
    JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse JSON after cleaning:', e);
    console.debug('Raw input:', raw);
    console.debug('Cleaned output:', cleaned);
    
    // If we can extract a feedback string, create valid JSON with it
    if (cleaned.includes('"feedback"')) {
      const feedbackMatch = cleaned.match(/"feedback":\s*"([^"]*)"/);
      if (feedbackMatch) {
        return `{"correct": false, "feedback": "${feedbackMatch[1]}"}`;
      }
    }
    
    // Last resort - return basic JSON
    return `{"correct": false, "feedback": "Unable to process response. Please try again."}`;
  }
  
  return cleaned;
} 