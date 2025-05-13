'use client';
import { create } from 'zustand';

// Types for roadmap
export interface Milestone {
  name: string;
  topics: string[];
}

export interface Roadmap {
  milestones: Milestone[];
}

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

// State for managing curriculum progress
interface RoadmapState {
  roadmap: Roadmap | null;
  currentMilestoneIndex: number;
  currentTopicIndex: number;
  // Track which milestones are actually completed
  completedMilestones: number[];
  // Track which topics are completed in each milestone
  completedTopics: Record<number, number[]>;
  tasks: Task[];
  setRoadmap: (roadmap: Roadmap) => void;
  setCurrentMilestoneIndex: (index: number) => void;
  setCurrentTopicIndex: (index: number) => void;
  markMilestoneCompleted: (milestoneIndex: number) => void;
  markTopicCompleted: (milestoneIndex: number, topicIndex: number) => void;
  isMilestoneCompleted: (milestoneIndex: number) => boolean;
  isTopicCompleted: (milestoneIndex: number, topicIndex: number) => boolean;
  setTasks: (tasks: Task[]) => void;
  markTaskCompleted: (index: number) => void;
}

// Helpers to get initial persisted state
const getInitialRoadmap = (): Roadmap | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('roadmap');
  return stored ? JSON.parse(stored) : null;
};

const getInitialIndex = (): number => {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('currentMilestoneIndex');
  return stored ? parseInt(stored, 10) : 0;
};

const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tasks');
  return stored ? JSON.parse(stored) : [];
};

const getInitialCompletedMilestones = (): number[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('completedMilestones');
  return stored ? JSON.parse(stored) : [];
};

const getInitialCompletedTopics = (): Record<number, number[]> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('completedTopics');
  return stored ? JSON.parse(stored) : {};
};

export const useRoadmap = create<RoadmapState>((set, get) => ({
  roadmap: getInitialRoadmap(),
  currentMilestoneIndex: getInitialIndex(),
  currentTopicIndex: 0,
  completedMilestones: getInitialCompletedMilestones(),
  completedTopics: getInitialCompletedTopics(),
  tasks: getInitialTasks(),

  setRoadmap: (roadmap: Roadmap) => {
    localStorage.setItem('roadmap', JSON.stringify(roadmap));
    set({ 
      roadmap, 
      currentMilestoneIndex: 0, 
      currentTopicIndex: 0, 
      tasks: [],
      completedMilestones: [],
      completedTopics: {}
    });
  },

  setCurrentMilestoneIndex: (currentMilestoneIndex: number) => {
    localStorage.setItem('currentMilestoneIndex', currentMilestoneIndex.toString());
    set({ currentMilestoneIndex, currentTopicIndex: 0, tasks: [] });
  },

  setCurrentTopicIndex: (currentTopicIndex: number) => {
    set({ currentTopicIndex });
  },

  markMilestoneCompleted: (milestoneIndex: number) => {
    const { completedMilestones } = get();
    if (!completedMilestones.includes(milestoneIndex)) {
      const newCompletedMilestones = [...completedMilestones, milestoneIndex].sort((a, b) => a - b);
      localStorage.setItem('completedMilestones', JSON.stringify(newCompletedMilestones));
      set({ completedMilestones: newCompletedMilestones });
    }
  },

  markTopicCompleted: (milestoneIndex: number, topicIndex: number) => {
    const { completedTopics, roadmap } = get();
    
    // Create a copy of the current state
    const newCompletedTopics = { ...completedTopics };
    
    // Initialize array for this milestone if it doesn't exist
    if (!newCompletedTopics[milestoneIndex]) {
      newCompletedTopics[milestoneIndex] = [];
    }
    
    // Add the topic if not already included
    if (!newCompletedTopics[milestoneIndex].includes(topicIndex)) {
      newCompletedTopics[milestoneIndex] = [
        ...newCompletedTopics[milestoneIndex],
        topicIndex
      ].sort((a, b) => a - b);
    }
    
    // Check if all topics in this milestone are completed
    if (roadmap && newCompletedTopics[milestoneIndex].length === roadmap.milestones[milestoneIndex]?.topics.length) {
      get().markMilestoneCompleted(milestoneIndex);
    }
    
    // Save and update state
    localStorage.setItem('completedTopics', JSON.stringify(newCompletedTopics));
    set({ completedTopics: newCompletedTopics });
  },

  isMilestoneCompleted: (milestoneIndex: number) => {
    return get().completedMilestones.includes(milestoneIndex);
  },

  isTopicCompleted: (milestoneIndex: number, topicIndex: number) => {
    const { completedTopics } = get();
    return completedTopics[milestoneIndex]?.includes(topicIndex) || false;
  },

  setTasks: (tasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    set({ tasks });
  },

  markTaskCompleted: (index: number) => {
    const { tasks } = get();
    const newTasks = tasks.map((t: Task, i: number) =>
      i === index ? { ...t, completed: true } : t
    );
    localStorage.setItem('tasks', JSON.stringify(newTasks));
    set({ tasks: newTasks });
  },
})); 