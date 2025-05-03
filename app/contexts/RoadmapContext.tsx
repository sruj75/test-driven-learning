'use client';
import { create } from 'zustand';

// Define types
export type Concept = string;

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  concepts: Concept[];
  estimatedDays: number;
}

export interface Roadmap {
  roadmap: RoadmapStep[];
  totalEstimatedDays: number;
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

interface RoadmapState {
  roadmap: Roadmap | null;
  currentStepIndex: number;
  questions: Question[];
  tasks: Task[];
  gaps: string[];
  setRoadmap: (roadmap: Roadmap) => void;
  setCurrentStepIndex: (index: number) => void;
  setQuestions: (questions: Question[]) => void;
  setGaps: (gaps: string[]) => void;
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
  const stored = localStorage.getItem('currentStepIndex');
  return stored ? parseInt(stored, 10) : 0;
};

const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tasks');
  return stored ? JSON.parse(stored) : [];
};

export const useRoadmap = create<RoadmapState>((set, get) => ({
  roadmap: getInitialRoadmap(),
  currentStepIndex: getInitialIndex(),
  questions: [],
  tasks: getInitialTasks(),
  gaps: [],

  setRoadmap: (roadmap: Roadmap) => {
    localStorage.setItem('roadmap', JSON.stringify(roadmap));
    set({ roadmap });
  },

  setCurrentStepIndex: (currentStepIndex: number) => {
    localStorage.setItem('currentStepIndex', currentStepIndex.toString());
    // Reset step-specific data
    set({ currentStepIndex, questions: [], tasks: [], gaps: [] });
  },

  setQuestions: (questions: Question[]) => {
    set({ questions });
  },

  setGaps: (gaps: string[]) => {
    set({ gaps });
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