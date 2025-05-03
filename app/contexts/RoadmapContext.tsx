'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types
type Concept = string;

interface RoadmapStep {
  stepNumber: number;
  title: string;
  concepts: Concept[];
  estimatedDays: number;
}

interface Roadmap {
  roadmap: RoadmapStep[];
  totalEstimatedDays: number;
}

interface Question {
  id: string;
  question: string;
  type: string;
}

interface Video {
  id: string; 
  title: string;
  url: string;
}

interface Task {
  topic: string;
  videos: Video[];
  explanation: string;
  completed: boolean;
}

interface RoadmapContextType {
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

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export function RoadmapProvider({ children }: { children: React.ReactNode }) {
  const [roadmap, setRoadmapState] = useState<Roadmap | null>(null);
  const [currentStepIndex, setCurrentStepIndexState] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  // Store tasks separately for each roadmap step
  const [tasksByStep, setTasksByStep] = useState<Record<number, Task[]>>({});
  const [gaps, setGapsState] = useState<string[]>([]);

  // Load persisted roadmap and index from localStorage once on mount
  useEffect(() => {
    const storedRoadmap = localStorage.getItem('roadmap');
    const storedIndex = localStorage.getItem('currentStepIndex');
    if (storedRoadmap) {
      setRoadmapState(JSON.parse(storedRoadmap));
    }
    if (storedIndex) {
      setCurrentStepIndexState(parseInt(storedIndex, 10));
    }
  }, []);

  const markTaskCompleted = (index: number) => {
    setTasksByStep(prevMap => {
      const current = prevMap[currentStepIndex] || [];
      const updated = [...current];
      updated[index] = { ...updated[index], completed: true };
      const newMap = { ...prevMap, [currentStepIndex]: updated };
      localStorage.setItem('tasksByStep', JSON.stringify(newMap));
      return newMap;
    });
  };

  // Wrap setters to persist
  const setRoadmap = (rm: Roadmap) => {
    setRoadmapState(rm);
    localStorage.setItem('roadmap', JSON.stringify(rm));
  };

  // Wrap setter to persist and reset per-step data
  const setCurrentStepIndex = (idx: number) => {
    setCurrentStepIndexState(idx);
    localStorage.setItem('currentStepIndex', idx.toString());
    // Reset data for the new step only
    setTasks([]); // clears tasks for current idx
    setQuestions([]);
    setGapsState([]);
  };

  // Wrap tasks setter to persist
  const setTasks = (ts: Task[]) => {
    setTasksByStep(prevMap => {
      const newMap = { ...prevMap, [currentStepIndex]: ts };
      localStorage.setItem('tasksByStep', JSON.stringify(newMap));
      return newMap;
    });
  };

  // Gaps setter (persist optional)
  const setGaps = (newGaps: string[]) => {
    setGapsState(newGaps);
    // optionally persist: localStorage.setItem('gaps', JSON.stringify(newGaps));
  };

  // Load stored tasks on mount
  useEffect(() => {
    const stored = localStorage.getItem('tasksByStep');
    if (stored) setTasksByStep(JSON.parse(stored));
    // TODO: load gaps if persisted per step
  }, []);

  // Derive current tasks for this step
  const tasks = tasksByStep[currentStepIndex] || [];

  return (
    <RoadmapContext.Provider
      value={{
        roadmap,
        currentStepIndex,
        questions,
        tasks,
        gaps,
        setRoadmap,
        setCurrentStepIndex,
        setQuestions,
        setGaps,
        setTasks,
        markTaskCompleted
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
} 