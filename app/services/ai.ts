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
export interface RoadmapStep {
  stepNumber: number;
  title: string;
  concepts: string[];
  estimatedDays: number;
}

export interface Roadmap {
  roadmap: RoadmapStep[];
  totalEstimatedDays: number;
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
 * Checks if the user has mastered the current topic based on task completion
 */
export async function checkMastery(topic: string, tasks: Task[]): Promise<boolean> {
  console.log('Checking mastery for:', topic);
  
  // For now, we'll simply check if all tasks are completed
  const allTasksCompleted = tasks.every(task => task.completed);
  
  return allTasksCompleted;
} 