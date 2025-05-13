'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useRoadmap } from '../../../../../../contexts/RoadmapContext';
import { generateResources } from '../../../../../../services/ai';
import { parseRouteParams } from '../../../../../../lib/utils';

export default function TopicResourcesPage() {
  // State & hooks
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const {
    roadmap,
    setCurrentMilestoneIndex,
    setCurrentTopicIndex,
    tasks,
    setTasks,
    markTaskCompleted,
  } = useRoadmap();

  // Hydration guard: mark mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse routing params using utility function
  const { milestoneIndex, topicIndex } = parseRouteParams(params);

  // Load resources when topic or milestone changes
  useEffect(() => {
    if (!roadmap) return;

    try {
      // Check if milestone exists
      if (!roadmap.milestones || !roadmap.milestones[milestoneIndex]) {
        console.error('Milestone not found:', { milestoneIndex, availableMilestones: roadmap.milestones?.length });
        setError(`Milestone ${milestoneIndex + 1} not found. Please return to dashboard.`);
        return;
      }

      const milestone = roadmap.milestones[milestoneIndex];
      
      // Check if topic exists
      if (!milestone.topics || !milestone.topics[topicIndex]) {
        console.error('Topic not found:', { 
          milestoneIndex, 
          topicIndex,
          milestoneName: milestone.name,
          availableTopics: milestone.topics?.length 
        });
        setError(`Topic ${topicIndex + 1} not found in milestone ${milestone.name}. Please return to dashboard.`);
        return;
      }

      setCurrentMilestoneIndex(milestoneIndex);
      setCurrentTopicIndex(topicIndex);
      
      // Clear any existing tasks
      setTasks([]);
      setIsLoading(true);
      setError(null);
      
      const topicName = milestone.topics[topicIndex];
      console.log('Loading topic resources:', { topicName, milestoneIndex, topicIndex });

      generateResources([topicName])
        .then(resources => setTasks(resources))
        .catch(err => {
          console.error('Error generating resources:', err);
          setError('Failed to load resources. Please try again.');
        })
        .finally(() => setIsLoading(false));
    } catch (err) {
      console.error('Unexpected error in resources page:', err);
      setError('An unexpected error occurred. Please return to dashboard and try again.');
      setIsLoading(false);
    }
  }, [roadmap, milestoneIndex, topicIndex, setCurrentMilestoneIndex, setCurrentTopicIndex, setTasks]);

  // Render guards
  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p>Loading resources...</p>
      </div>
    );
  }
  
  if (!roadmap) {
    return (
      <div className="p-8 text-center">
        <p>No roadmap found. Please return to the home page.</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading resources for milestone {milestoneIndex + 1}, topic {topicIndex + 1}...</p>
      </div>
    );
  }
  
  // Ensure milestone and topic exist
  if (!roadmap.milestones[milestoneIndex] || !roadmap.milestones[milestoneIndex].topics[topicIndex]) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Topic not found. Please return to dashboard.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  const milestone = roadmap.milestones[milestoneIndex];
  const topicName = milestone.topics[topicIndex];
  const allCompleted = tasks.every(task => task.completed);
  
  const handleProceedToTest = () => {
    // Navigate to test page for current topic
    router.push(`/dashboard/domain/${milestoneIndex + 1}/topic/${topicIndex + 1}/test`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {milestone.name} - Topic: {topicName}
        </h1>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {tasks.length === 0 ? (
          <div className="p-4 border rounded-lg">
            <p>No resources available. Please return to dashboard and try again.</p>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div key={idx} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{task.topic}</h2>
              <div className="prose max-w-none mb-4">
                <ReactMarkdown>{task.explanation}</ReactMarkdown>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => markTaskCompleted(idx)}
                  disabled={task.completed}
                  className={`px-4 py-2 rounded ${
                    task.completed
                      ? 'bg-green-200 text-green-800 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {task.completed ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleProceedToTest}
          disabled={!allCompleted || tasks.length === 0}
          className={`px-6 py-2 rounded ${
            !allCompleted || tasks.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Proceed to Test
        </button>
      </div>
    </div>
  );
} 