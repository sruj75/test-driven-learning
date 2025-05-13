'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useRoadmap } from '../../../../../../contexts/RoadmapContext';
import { generateTest, measureUnderstanding, generateResources, Question, Task, KnowledgeAssessment } from '../../../../../../services/ai';
import { parseRouteParams } from '../../../../../../lib/utils';

export default function TopicTestPage() {
  // State
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState<{text: string; type: 'error' | 'info' | 'success'} | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<KnowledgeAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifiedGaps, setIdentifiedGaps] = useState<string[]>([]);
  const [understandingScores, setUnderstandingScores] = useState<number[]>([]);
  const [assessingUnderstanding, setAssessingUnderstanding] = useState(false);
  const [showingResourceSuggestions, setShowingResourceSuggestions] = useState(false);
  const [suggestedResources, setSuggestedResources] = useState<Task[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  
  // Hooks
  const router = useRouter();
  const params = useParams();
  const { 
    roadmap, 
    setCurrentMilestoneIndex, 
    setCurrentTopicIndex,
    markTopicCompleted
  } = useRoadmap();

  // Parse route params using utility function
  const { milestoneIndex, topicIndex } = parseRouteParams(params);

  // Constants - can be adjusted based on difficulty level
  const UNDERSTANDING_THRESHOLD = 70; // 70% understanding score required for mastery

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update context with current indices
  useEffect(() => {
    if (roadmap) {
      setCurrentMilestoneIndex(milestoneIndex);
      setCurrentTopicIndex(topicIndex);
    }
  }, [roadmap, milestoneIndex, topicIndex, setCurrentMilestoneIndex, setCurrentTopicIndex]);

  // Load test questions
  useEffect(() => {
    if (!roadmap || !mounted) return;

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

      const topic = milestone.topics[topicIndex];
      console.log('Loading test for topic:', { topic, milestoneIndex, topicIndex });

      setIsLoading(true);
      setError(null);
      
      // Reset state when loading new questions
      setCurrentQuestion(0);
      setQuestions([]);
      setAnswers([]);
      setAssessmentResult(null);
      setIdentifiedGaps([]);
      setUnderstandingScores([]);
      setShowingResourceSuggestions(false);
      setSuggestedResources([]);
      
      generateTest(topic, [topic])
        .then(newQuestions => {
          if (!newQuestions || newQuestions.length === 0) {
            setError('No test questions could be generated. Please try again.');
            return;
          }
          
          console.log(`Loaded ${newQuestions.length} questions for topic:`, topic);
          setQuestions(newQuestions);
          setAnswers(new Array(newQuestions.length).fill(''));
          setUnderstandingScores(new Array(newQuestions.length).fill(0));
        })
        .catch(err => {
          console.error('Error loading test questions:', err);
          setError('Failed to load test questions. Please try again.');
        })
        .finally(() => setIsLoading(false));
    } catch (err) {
      console.error('Unexpected error in test page:', err);
      setError('An unexpected error occurred. Please return to dashboard and try again.');
      setIsLoading(false);
    }
  }, [roadmap, milestoneIndex, topicIndex, mounted]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleAssessAnswer = async () => {
    if (!questions[currentQuestion] || !roadmap) return;
    
    setIsSubmitting(true);
    try {
      const question = questions[currentQuestion];
      const answer = answers[currentQuestion];
      const context = roadmap?.milestones[milestoneIndex]?.topics[topicIndex] || '';
      
      // Use the new assessment service
      const result = await measureUnderstanding(question.question, answer, context);
      setAssessmentResult(result);
      
      // Update understanding scores
      const newScores = [...understandingScores];
      newScores[currentQuestion] = result.understandingScore;
      setUnderstandingScores(newScores);
      
      // Add any new knowledge gaps to our tracking
      if (result.identifiedGaps.length > 0) {
        setIdentifiedGaps(prev => {
          const newGaps = [...prev];
          result.identifiedGaps.forEach(gap => {
            if (!newGaps.includes(gap)) {
              newGaps.push(gap);
            }
          });
          return newGaps;
        });
      }
    } catch (error) {
      console.error('Error assessing answer:', error);
      setAssessmentResult({
        understandingScore: 0,
        identifiedGaps: ["Error analyzing your answer"],
        feedback: "Sorry, we couldn't analyze your answer. Please try again.",
        nextSteps: "Try rephrasing your answer or try again later.",
        readyToProgress: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to calculate average understanding score
  const calculateAverageScore = (): number => {
    // Only count questions that have been answered
    const answeredScores = understandingScores.filter((score, index) => answers[index]?.trim().length > 0);
    if (answeredScores.length === 0) return 0;
    
    const sum = answeredScores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / answeredScores.length);
  };
  
  // Function to generate resources for identified knowledge gaps
  const handleGenerateResources = async () => {
    if (!identifiedGaps.length) return;
    
    setResourcesLoading(true);
    try {
      const resources = await generateResources(identifiedGaps);
      setSuggestedResources(resources);
      setShowingResourceSuggestions(true);
    } catch (error) {
      console.error("Error generating resources:", error);
      setError("Failed to generate resources for your knowledge gaps. Please try again.");
      // Reset loading state but keep showing resource suggestions UI
      setShowingResourceSuggestions(true);
    } finally {
      setResourcesLoading(false);
    }
  };
  
  // Function to assess if the user has mastered the topic
  const assessTopicMastery = () => {
    if (!roadmap || questions.length === 0) return false;
    
    // Safety check: ensure all questions have been answered
    const answeredCount = answers.filter(Boolean).length;
    if (answeredCount < questions.length) {
      console.error(`Cannot assess mastery yet: only ${answeredCount} out of ${questions.length} questions answered`);
      // Return false instead of just returning undefined
      return false;
    }
    
    setAssessingUnderstanding(true);
    try {
      // Calculate average understanding score
      const averageScore = calculateAverageScore();
      const hasSignificantGaps = identifiedGaps.length > 3;
      
      console.log('Assessing understanding for topic:', {
        topic: roadmap.milestones[milestoneIndex]?.topics[topicIndex],
        averageScore,
        identifiedGaps,
        threshold: UNDERSTANDING_THRESHOLD,
        hasSignificantGaps
      });
      
      // If score is high enough and no significant gaps found
      if (averageScore >= UNDERSTANDING_THRESHOLD && !hasSignificantGaps) {
        // Mark the topic as completed
        markTopicCompleted(milestoneIndex, topicIndex);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error assessing mastery:', error);
      return false;
    } finally {
      setAssessingUnderstanding(false);
    }
  };
  
  // Function to navigate to the next topic
  const handleNavigateToNextTopic = () => {
    if (!roadmap) {
      console.error('Cannot navigate: roadmap is null');
      return;
    }
    
    try {
      const milestone = roadmap.milestones[milestoneIndex];
      if (!milestone) {
        console.error('Could not navigate: milestone not found', { milestoneIndex });
        return;
      }
      
      const topicsCount = milestone.topics.length;
      const totalMilestones = roadmap.milestones.length;
      
      // Always go to the next topic in current milestone if available
      if (topicIndex < topicsCount - 1) {
        // Go to next topic in same milestone
        const nextTopicIndex = topicIndex + 1;
        console.log(`Navigating to next topic in same milestone: ${nextTopicIndex}`);
        
        // Update state first, then navigate
        setCurrentTopicIndex(nextTopicIndex);
        
        // Navigate to resources page of next topic in the same milestone
        router.push(`/dashboard/domain/${milestoneIndex + 1}/topic/${nextTopicIndex + 1}/resources`);
      } else if (milestoneIndex < totalMilestones - 1) {
        // Only go to next milestone if all topics in current milestone are completed
        const nextMilestoneIndex = milestoneIndex + 1;
        console.log(`Navigating to first topic in next milestone: ${nextMilestoneIndex}`);
        
        // Update both milestone and topic indices
        setCurrentMilestoneIndex(nextMilestoneIndex);
        setCurrentTopicIndex(0); // Reset to first topic
        
        // Navigate to resources page of first topic in next milestone
        router.push(`/dashboard/domain/${nextMilestoneIndex + 1}/topic/1/resources`);
      } else {
        // Completed all milestones
        console.log('Completed all milestones, returning to dashboard');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Failed to navigate to the next topic. Please return to dashboard.');
    }
  };

  // Function to show a message to the user that automatically dismisses
  const showMessage = (text: string, type: 'error' | 'info' | 'success' = 'info', duration = 5000) => {
    setUserMessage({ text, type });
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setUserMessage(null);
    }, duration);
  };

  // Render resource suggestions section - redesigned for brevity and focus
  const renderResourceSuggestions = () => {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Fix Knowledge Gaps: {topicName}
          </h1>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Focus Areas:</h2>
          <ul className="list-disc pl-5 space-y-1">
            {identifiedGaps.map((gap, index) => (
              <li key={index} className="text-gray-700 font-medium">{gap}</li>
            ))}
          </ul>
        </div>

        {resourcesLoading ? (
          <div className="p-4 text-center">
            <p>Generating quick resources...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {suggestedResources.length > 0 ? (
              suggestedResources.map((resource, index) => (
                <div key={index} className="border bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-3 text-blue-800">{resource.topic}</h3>
                  
                  {/* Parse and format explanation into bullet points */}
                  <div className="space-y-4">
                    {resource.explanation.split('\n\n').map((paragraph, i) => {
                      // Skip empty paragraphs
                      if (!paragraph.trim()) return null;
                      
                      // If paragraph starts with - or *, treat as bullet point
                      if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                        return (
                          <ul key={`list-${i}`} className="list-disc pl-5 space-y-2">
                            {paragraph.split('\n').map((item, j) => (
                              <li key={`item-${j}`} className="text-gray-700">
                                {item.replace(/^[-*]\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      
                      // If paragraph contains code or example, display as code
                      if (paragraph.includes('```') || paragraph.includes('example:') || paragraph.includes('Example:')) {
                        return (
                          <div key={`code-${i}`} className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm overflow-x-auto">
                            {paragraph.replace(/```\w*\n?|```/g, '')}
                          </div>
                        );
                      }
                      
                      // Regular paragraph - display as highlight or bullet
                      return (
                        <div key={`para-${i}`} className="flex space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <p className="text-gray-700">{paragraph}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {resource.videos && resource.videos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-medium text-sm text-gray-600 mb-2">Quick Reference:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {resource.videos.map((video, vIndex) => (
                          <a 
                            key={vIndex}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {video.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-4 bg-white rounded-lg shadow border">
                <p className="text-gray-700">No specific resources found. Review course materials or try again.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setShowingResourceSuggestions(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Back to Test
          </button>
          <button
            onClick={() => {
              // Check if we have answered all questions before trying to assess mastery
              const answeredCount = answers.filter(Boolean).length;
              
              if (answeredCount === questions.length) {
                // Only try to assess mastery if all questions are answered
                if (assessTopicMastery()) {
                  handleNavigateToNextTopic();
                } else {
                  setCurrentQuestion(0);
                  setAssessmentResult(null);
                  setShowingResourceSuggestions(false);
                }
              } else {
                // If not all questions are answered, just go back to the test
                setShowingResourceSuggestions(false);
                // Focus on the first unanswered question
                const firstUnansweredIndex = answers.findIndex(a => !a || !a.trim());
                if (firstUnansweredIndex >= 0) {
                  setCurrentQuestion(firstUnansweredIndex);
                }
              }
            }}
            className="px-4 py-2 bg-blue-500 rounded-lg shadow-sm text-white hover:bg-blue-600 focus:outline-none"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Render final assessment result
  const renderFinalAssessment = () => {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Topic Understanding Assessment: {milestone.name} - {topicName}
          </h1>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        <div className="border p-6 rounded-lg mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Your Understanding</h2>
          
          {assessingUnderstanding ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-pulse">
                <p>Assessing your understanding...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg mb-6 bg-green-100 border border-green-200">
                <p className="text-lg font-medium mb-2 text-green-800">
                  Great job! You&apos;ve demonstrated sufficient understanding of this topic.
                </p>
                <div className="mt-4">
                  <p className="font-medium">Understanding Score</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-green-600" 
                      style={{ width: `${averageUnderstandingScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {averageUnderstandingScore}% • Required: {UNDERSTANDING_THRESHOLD}%
                  </p>
                </div>
              </div>
              
              {identifiedGaps.length > 0 && (
                <div className="p-4 rounded-lg mb-6 bg-blue-50 border border-blue-200">
                  <p className="font-medium text-blue-800 mb-2">Areas to review later:</p>
                  <ul className="list-disc pl-5">
                    {identifiedGaps.slice(0, 3).map((gap, i) => (
                      <li key={i} className="text-gray-700 mb-1">{gap}</li>
                    ))}
                    {identifiedGaps.length > 3 && (
                      <li className="text-gray-700">...and {identifiedGaps.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              <button
                onClick={handleNavigateToNextTopic}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full font-medium"
              >
                Proceed to Next Topic
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render the current question and answer form
  const renderQuestionInterface = () => {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Knowledge Check: {milestone.name} - {topicName}
          </h1>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {/* Show user messages/alerts */}
        {userMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            userMessage.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
            userMessage.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
            'bg-blue-100 border border-blue-200 text-blue-800'
          }`}>
            {userMessage.text}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          
          {averageUnderstandingScore > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Understanding:</span>
              <div className="w-28 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    averageUnderstandingScore >= UNDERSTANDING_THRESHOLD ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${averageUnderstandingScore}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{averageUnderstandingScore}%</span>
            </div>
          )}
        </div>

        <div className="border p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">{question?.question}</h2>
          <textarea
            value={answers[currentQuestion] || ''}
            onChange={handleAnswerChange}
            className="w-full border border-gray-300 rounded p-3 min-h-[150px] text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-700 transition-colors"
            placeholder="Type your answer here..."
            disabled={isSubmitting || assessmentResult !== null}
          />
          
          {assessmentResult && (
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-blue-800">Understanding Assessment</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {assessmentResult.understandingScore}%
                  </span>
                </div>
                <p className="text-gray-700">{assessmentResult.feedback}</p>
                
                {assessmentResult.identifiedGaps.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-blue-800">Areas to focus on:</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {assessmentResult.identifiedGaps.map((gap, i) => (
                        <li key={i} className="text-gray-700 text-sm">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Next steps:</p>
                  <p className="text-gray-700 text-sm">{assessmentResult.nextSteps}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(prev => prev - 1);
                  setAssessmentResult(null);
                }
              }}
              disabled={currentQuestion === 0 || isSubmitting}
              className="px-4 py-2 border rounded disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            
            {identifiedGaps.length > 0 && (
              <button
                onClick={handleGenerateResources}
                className="px-4 py-2 border border-yellow-400 rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
              >
                Address Knowledge Gaps
              </button>
            )}
          </div>

          {assessmentResult === null ? (
            <button
              onClick={handleAssessAnswer}
              disabled={isSubmitting || !answers[currentQuestion]?.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            >
              {isSubmitting ? 'Analyzing...' : 'Check Understanding'}
            </button>
          ) : (
            <div className="flex space-x-3">
              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentQuestion(prev => prev + 1);
                    setAssessmentResult(null);
                  }}
                  className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Check if all questions are answered
                    const allAnswered = answers.every(a => a?.trim().length > 0);
                    
                    if (!allAnswered) {
                      // If not all questions are answered, find the first unanswered one
                      const firstUnansweredIndex = answers.findIndex(a => !a || !a.trim());
                      if (firstUnansweredIndex !== -1 && firstUnansweredIndex !== currentQuestion) {
                        // Navigate to the first unanswered question
                        setCurrentQuestion(firstUnansweredIndex);
                        setAssessmentResult(null);
                        
                        // Show error message instead of alert
                        showMessage(`Please answer question ${firstUnansweredIndex + 1} before completing the assessment.`, 'error');
                        return;
                      }
                    }
                    
                    // If we're on the last unanswered question or all are answered
                    if (allAnswered) {
                      const masteryResult = assessTopicMastery();
                      if (masteryResult) {
                        handleNavigateToNextTopic();
                      } else if (identifiedGaps.length > 0) {
                        handleGenerateResources();
                      }
                    }
                  }}
                  className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:bg-green-700"
                >
                  Complete Assessment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render guards
  if (!mounted) {
    return <div className="p-8 text-center">Loading...</div>;
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
        <p>Loading test for milestone {milestoneIndex + 1}, topic {topicIndex + 1}...</p>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>No questions found. Please try again later.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
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
  const question = questions[currentQuestion];
  const averageUnderstandingScore = calculateAverageScore();

  // Show resource suggestions if needed
  if (showingResourceSuggestions) {
    return renderResourceSuggestions();
  }

  // Show final assessment when all questions are answered
  if (answers.filter(Boolean).length === questions.length && averageUnderstandingScore >= UNDERSTANDING_THRESHOLD) {
    assessTopicMastery();
    return renderFinalAssessment();
  }

  // Main component render
  return renderQuestionInterface();
} 