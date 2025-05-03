"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useRoadmap } from '../../../../contexts/RoadmapContext';
import { checkMastery } from '../../../../services/ai';

export default function DomainResourcesPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const stepParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const stepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0;

  const {
    roadmap,
    currentStepIndex,
    tasks,
    markTaskCompleted,
    setCurrentStepIndex,
  } = useRoadmap();
  const [isChecking, setIsChecking] = useState(false);

  // On step change, reset checking state
  useEffect(() => {
    setIsChecking(false);
    if (stepIndex !== currentStepIndex) {
      setCurrentStepIndex(stepIndex);
    }
  }, [stepIndex, currentStepIndex, setCurrentStepIndex]);

  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  const currentStep = roadmap.roadmap[stepIndex];
  const allCompleted = tasks.every(task => task.completed);

  // If no tasks generated yet, prompt user to take the test
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>No resources available yet. Please complete the test to generate your personalized tasks.</p>
        <button
          onClick={() => router.push(`/dashboard/domain/${stepParam}/test`)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Go to Test
        </button>
      </div>
    );
  }

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handleComplete = (index: number) => {
    markTaskCompleted(index);
  };

  const handleContinue = async () => {
    setIsChecking(true);
    try {
      const hasMastered = await checkMastery(currentStep.title, tasks);
      if (hasMastered) {
        // If mastered this milestone, move to next milestone's test or back to dashboard
        if (stepIndex < roadmap.roadmap.length - 1) {
          const nextIndex = stepIndex + 1;
          setCurrentStepIndex(nextIndex);
          router.push(`/dashboard/domain/${nextIndex + 1}/test`);
        } else {
          // Completed all milestones
          alert('Congratulations! You have completed the entire roadmap!');
          router.push('/dashboard');
        }
      } else {
        // Not yet mastered: repeat test for current milestone
        router.push(`/dashboard/domain/${stepParam}/test`);
      }
    } catch (err) {
      console.error('Error checking mastery:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning: {currentStep.title}</h1>
        <button onClick={handleExit} className="text-red-500 hover:underline">
          Exit
        </button>
      </div>

      <div className="space-y-6">
        {tasks.map((task, idx) => (
          <div key={idx} className="border p-4 rounded-lg">
            <h2 className="font-semibold mb-2">{task.topic}</h2>
            <div className="mb-4">
              <ReactMarkdown>{task.explanation}</ReactMarkdown>
            </div>
            {task.videos.length > 0 && (
              <ul className="mb-4 list-disc ml-5">
                {task.videos.map(video => (
                  <li key={video.id}>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {video.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => handleComplete(idx)}
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

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!allCompleted || isChecking}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-blue-300"
        >
          {isChecking ? 'Checking...' : 'Continue'}
        </button>
      </div>
    </div>
  );
} 