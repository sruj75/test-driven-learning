'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../../contexts/RoadmapContext';
import { checkMastery } from '../../services/ai';
import ReactMarkdown from 'react-markdown';

export default function PlaygroundPage() {
  const router = useRouter();
  const { roadmap, currentStepIndex, tasks, markTaskCompleted, setCurrentStepIndex } = useRoadmap();
  const [isMasteryChecking, setIsMasteryChecking] = useState(false);
  
  const allTasksCompleted = tasks.every(task => task.completed);
  
  const handleTaskCompletion = (index: number) => {
    markTaskCompleted(index);
  };
  
  const handleContinue = async () => {
    if (!roadmap) return;
    
    setIsMasteryChecking(true);
    
    try {
      const currentStep = roadmap.roadmap[currentStepIndex];
      const hasMastered = await checkMastery(currentStep.title, tasks);
      
      if (hasMastered) {
        // Move to next step if available
        if (currentStepIndex < roadmap.roadmap.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          // Handle roadmap completion
          alert('Congratulations! You have completed the entire roadmap!');
          router.push('/');
          return;
        }
      }
      
      // Navigate back to test screen
      router.push('/test-playground/test');
    } catch (error) {
      console.error('Error checking mastery:', error);
    } finally {
      setIsMasteryChecking(false);
    }
  };

  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Learning Playground: {roadmap.roadmap[currentStepIndex].title}
      </h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your To-Do List:</h2>
        
        {tasks.length === 0 ? (
          <p>No tasks available. Please take a test first.</p>
        ) : (
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">{task.topic}</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">Explanation:</p>
                  <div className="bg-gray-50 p-3 rounded markdown-content">
                    <ReactMarkdown>{task.explanation}</ReactMarkdown>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">Recommended Videos:</p>
                  <ul className="space-y-2">
                    {task.videos.map((video) => (
                      <li key={video.id} className="flex items-center">
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleTaskCompletion(index)}
                  disabled={task.completed}
                  className={`${
                    task.completed ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white px-4 py-2 rounded`}
                >
                  {task.completed ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <button
          onClick={handleContinue}
          disabled={!allTasksCompleted || isMasteryChecking}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-blue-300"
        >
          {isMasteryChecking ? 'Checking your progress...' : 'Take the next test'}
        </button>
      </div>
    </div>
  );
} 