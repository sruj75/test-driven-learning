import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseRouteParams(params: { id?: string | string[], topic?: string | string[] }) {
  const milestoneParam = Array.isArray(params.id) ? params.id[0] : (params.id || '1');
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : (params.topic || '1');
  
  const milestoneIndex = parseInt(milestoneParam, 10) - 1;
  const topicIndex = parseInt(topicParam, 10) - 1;
  
  return {
    milestoneIndex,
    topicIndex,
    // Original params (1-indexed for URLs)
    milestoneParam: (milestoneIndex + 1).toString(),
    topicParam: (topicIndex + 1).toString(),
  };
}

export function getNextTopicPath(
  currentMilestoneIndex: number, 
  currentTopicIndex: number, 
  topicsInCurrentMilestone: number,
  totalMilestones: number
): string {
  console.log('getNextTopicPath called with:', {
    currentMilestoneIndex,
    currentTopicIndex,
    topicsInCurrentMilestone,
    totalMilestones
  });

  // All indices are 0-based internally, but 1-based in URLs
  if (currentTopicIndex < topicsInCurrentMilestone - 1) {
    // Go to next topic in same milestone
    const nextTopicIndex = currentTopicIndex + 1;
    const nextMilestoneParam = currentMilestoneIndex + 1; // For URL (1-indexed)
    const nextTopicParam = nextTopicIndex + 1; // For URL (1-indexed)
    
    const path = `/dashboard/domain/${nextMilestoneParam}/topic/${nextTopicParam}/resources`;
    console.log(`Navigating to next topic in same milestone: ${path}`);
    return path;
  } else {
    // Go to first topic in next milestone
    if (currentMilestoneIndex < totalMilestones - 1) {
      const nextMilestoneIndex = currentMilestoneIndex + 1;
      const nextMilestoneParam = nextMilestoneIndex + 1; // For URL (1-indexed)
      
      const path = `/dashboard/domain/${nextMilestoneParam}/topic/1/resources`;
      console.log(`Navigating to first topic in next milestone: ${path}`);
      return path;
    } else {
      // Completed all milestones
      console.log('Completed all milestones, returning to dashboard');
      return '/dashboard';
    }
  }
}