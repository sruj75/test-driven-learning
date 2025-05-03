'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../../contexts/RoadmapContext';
import { generateTest, analyzeGaps, generateResources } from '../../services/ai';

export default function TestPage() {
  const router = useRouter();
  const { roadmap, currentStepIndex, questions, setQuestions, setTasks } = useRoadmap();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Generate test questions when component mounts
    async function loadTest() {
      if (roadmap && roadmap.roadmap[currentStepIndex]) {
        const step = roadmap.roadmap[currentStepIndex];
        const newQuestions = await generateTest(step.title, step.concepts);
        setQuestions(newQuestions);
        // Initialize empty answers
        const initialAnswers: Record<string, string> = {};
        newQuestions.forEach(q => initialAnswers[q.id] = '');
        setAnswers(initialAnswers);
      }
    }
    
    loadTest();
  }, [roadmap, currentStepIndex, setQuestions]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Analyze gaps based on answers
      const gaps = await analyzeGaps(questions, answers);
      
      // Generate resources for the gaps
      const resources = await generateResources(gaps);
      setTasks(resources);
      
      // Navigate to the resource/playground screen
      router.push('/test-playground/playground');
    } catch (error) {
      console.error('Error during test submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  const currentStep = roadmap.roadmap[currentStepIndex];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test: {currentStep.title}</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Concepts being tested:</h2>
        <ul className="list-disc ml-5">
          {currentStep.concepts.map((concept, i) => (
            <li key={i}>{concept}</li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">{q.question}</h3>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              className="w-full border rounded p-2 min-h-[100px]"
              placeholder="Type your answer here..."
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.values(answers).some(a => !a.trim())}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-blue-300"
        >
          {isSubmitting ? 'Analyzing...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
} 