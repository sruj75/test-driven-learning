// Types for different components
export interface Question {
  id: string;
  question: string;
  type: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
}

export interface Task {
  topic: string;
  videos: Video[];
  explanation: string;
  completed: boolean;
}

// Types for the roadmap
export interface Milestone {
  name: string;
  topics: string[];
}

export interface Roadmap {
  milestones: Milestone[];
}

// Types for knowledge assessment
export interface KnowledgeAssessment {
  understandingScore: number; // 0-100 representing completeness of understanding
  identifiedGaps: string[]; // Array of specific knowledge gaps
  feedback: string; // Conversational feedback
  nextSteps: string; // Recommendation on what to study next
  readyToProgress: boolean; // Whether they can move to the next topic
}

/**
 * Generates a roadmap based on a conversation history
 */
export async function generateRoadmap(conversation: string[]): Promise<Roadmap> {
  const response = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Roadmap API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Generates test questions based on a topic and concepts
 */
export async function generateTest(topic: string, concepts: string[]): Promise<Question[]> {
  const response = await fetch('/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, concepts }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Test API error: ${response.status}`);
  }
  const data = await response.json();
  return data.questions;
}

/**
 * Analyzes user answers to identify knowledge gaps
 */
export async function analyzeGaps(questions: Question[], answers: Record<string, string>): Promise<string[]> {
  const topic = questions.length > 0 ? questions[0].question.split(' ').slice(0, 3).join(' ') : "the topic";
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, questions, answers }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Analyze API error: ${response.status}`);
  }
  const data = await response.json();
  return data.gaps;
}

/**
 * Generates learning resources for identified knowledge gaps
 */
export async function generateResources(gaps: string[]): Promise<Task[]> {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gaps }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Resources API error: ${response.status}`);
  }
  const data = await response.json();
  return data.resources;
}

/**
 * Measures understanding and identifies knowledge gaps based on a question and answer
 */
export async function measureUnderstanding(question: string, answer: string, context: string): Promise<KnowledgeAssessment> {
  const response = await fetch('/api/measure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      question, 
      answer, 
      context
    }),
  });
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Measure API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Checks if the user has mastered the current topic based on task completion
 */
export async function checkMastery(topic: string, tasks: Task[]): Promise<boolean> {
  console.log('Checking mastery for:', topic);
  
  // For now, we'll simply check if all tasks are completed
  const allTasksCompleted = tasks.every(task => task.completed);
  
  return allTasksCompleted;
} 