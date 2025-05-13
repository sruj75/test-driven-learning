'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../contexts/RoadmapContext';

export default function DashboardPage() {
  // Hydration guard to avoid SSR/client content mismatch
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { 
    setMounted(true); 
  }, []);

  const { 
    roadmap, 
    currentMilestoneIndex, 
    currentTopicIndex, 
    completedMilestones,
    completedTopics,
    isMilestoneCompleted,
    isTopicCompleted,
    setCurrentMilestoneIndex, 
    setCurrentTopicIndex 
  } = useRoadmap();

  // Calculate completion metrics
  const calculateCompletionMetrics = () => {
    if (!roadmap || !roadmap.milestones.length) return { 
      overallPercentage: 0, 
      completedMilestonesCount: 0,
      totalMilestones: 0,
      completedTopicsCount: 0,
      totalTopics: 0
    };

    const totalMilestones = roadmap.milestones.length;
    const completedMilestonesCount = completedMilestones.length;
    
    // Count total topics across all milestones
    let totalTopics = 0;
    roadmap.milestones.forEach(milestone => {
      totalTopics += milestone.topics.length;
    });
    
    // Count completed topics from our tracking data
    let completedTopicsCount = 0;
    Object.keys(completedTopics).forEach(milestoneKey => {
      const milestoneIndex = parseInt(milestoneKey, 10);
      completedTopicsCount += completedTopics[milestoneIndex]?.length || 0;
    });
    
    const overallPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
    
    return {
      overallPercentage,
      completedMilestonesCount,
      totalMilestones,
      completedTopicsCount,
      totalTopics
    };
  };

  // During hydration, show loading placeholder
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }
  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  const { 
    overallPercentage, 
    completedMilestonesCount, 
    totalMilestones,
    completedTopicsCount,
    totalTopics 
  } = calculateCompletionMetrics();

  const handleMilestoneClick = (milestoneIndex: number) => {
    // Update context state
    setCurrentMilestoneIndex(milestoneIndex);
    setCurrentTopicIndex(0); // Always start with first topic
    
    // Navigate to first topic's resources
    router.push(`/dashboard/domain/${milestoneIndex + 1}/topic/1/resources`);
  };

  const handleTopicClick = (milestoneIndex: number, topicIndex: number) => {
    // Update context state
    setCurrentMilestoneIndex(milestoneIndex);
    setCurrentTopicIndex(topicIndex);
    
    // Navigate to specific topic's resources
    router.push(`/dashboard/domain/${milestoneIndex + 1}/topic/${topicIndex + 1}/resources`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Learning Dashboard</h1>
      
      {/* Overall Progress Section */}
      <div className="mb-12 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Overall Progress</h2>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Completion</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{overallPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full" 
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
            <span>{completedTopicsCount} of {totalTopics} topics completed</span>
            <span>{completedMilestonesCount} of {totalMilestones} milestones completed</span>
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Learning Path</h2>
      <div className="space-y-8">
        {roadmap.milestones.map((milestone, idx) => {
          // Use the actual completion tracking to determine status
          const isCompleted = isMilestoneCompleted(idx);
          const isCurrent = idx === currentMilestoneIndex;
          const milestoneNumber = idx + 1;
          
          // Calculate milestone progress percentage based on completed topics
          const topicsInMilestone = milestone.topics.length;
          const completedTopicsInMilestone = completedTopics[idx]?.length || 0;
          const milestoneProgress = topicsInMilestone > 0 
            ? Math.round((completedTopicsInMilestone / topicsInMilestone) * 100)
            : 0;
          
          return (
            <div
              key={milestoneNumber}
              className={`border rounded-lg overflow-hidden ${
                isCompleted 
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30' 
                  : isCurrent 
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold flex items-center dark:text-white">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full mr-2 text-sm ${
                      isCompleted 
                        ? 'bg-green-500 dark:bg-green-600 text-white' 
                        : isCurrent 
                          ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {milestoneNumber}
                    </span>
                    {milestone.name}
                    {isCompleted && (
                      <svg className="ml-2 h-5 w-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h3>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{milestoneProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isCompleted 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : isCurrent 
                              ? 'bg-blue-500 dark:bg-blue-400' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ width: `${milestoneProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMilestoneClick(idx)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isCompleted 
                      ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700' 
                      : isCurrent 
                        ? 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                </button>
              </div>
              
              {/* Topic List */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {milestone.topics.map((topic, topicIdx) => {
                    // Use actual topic completion data to determine status
                    const isTopicCompletedStatus = isTopicCompleted(idx, topicIdx);
                    const isCurrentTopic = isCurrent && topicIdx === currentTopicIndex;
                    
                    return (
                      <li 
                        key={`${milestoneNumber}-${topicIdx}`} 
                        className={`p-3 pl-6 flex justify-between items-center ${
                          isTopicCompletedStatus 
                            ? 'bg-green-50 dark:bg-green-900/30' 
                            : isCurrentTopic 
                              ? 'bg-blue-50 dark:bg-blue-900/30' 
                              : ''
                        }`}
                      >
                        <div className="flex items-center">
                          {isTopicCompletedStatus ? (
                            <span className="h-5 w-5 mr-3 text-green-500 dark:text-green-400">
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : isCurrentTopic ? (
                            <span className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400">
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="h-5 w-5 mr-3 text-gray-300 dark:text-gray-600">
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                          <span className={`dark:text-gray-100 ${
                            isTopicCompletedStatus 
                              ? 'text-green-800 dark:text-green-300' 
                              : isCurrentTopic 
                                ? 'text-blue-800 dark:text-blue-300 font-medium' 
                                : ''
                          }`}>
                            {topic}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleTopicClick(idx, topicIdx)}
                          className={`text-sm px-3 py-1 rounded ${
                            isTopicCompletedStatus
                              ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700'
                              : isCurrentTopic
                                ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700'
                                : (!isCurrent && !isCompleted && !isTopicCompletedStatus) || (isCurrent && topicIdx > currentTopicIndex)
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          disabled={(!isCurrent && !isCompleted && !isTopicCompletedStatus) || (isCurrent && topicIdx > currentTopicIndex)}
                        >
                          {isTopicCompletedStatus ? 'Review' : isCurrentTopic ? 'Continue' : 'Locked'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 