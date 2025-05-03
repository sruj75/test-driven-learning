"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRoadmap } from '../../../../contexts/RoadmapContext';
import { generateTest, analyzeGaps, generateResources, Question } from '../../../../services/ai';

export default function DomainTestPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const stepParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const stepIndex = stepParam ? parseInt(stepParam, 10) - 1 : 0;

  const { roadmap, setCurrentStepIndex, questions, setQuestions, setTasks, tasks } = useRoadmap();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedStep, setLoadedStep] = useState<number | null>(null);

  useEffect(() => {
    if (!roadmap) return;
    if (loadedStep === stepIndex) return; // already loaded for this step
    setLoadedStep(stepIndex);
    setCurrentStepIndex(stepIndex);
    const step = roadmap.roadmap[stepIndex];
    if (!step) return;
    // load test questions once per step
    generateTest(step.title, step.concepts)
      .then(newQuestions => {
        // Ensure each question has a unique id
        const processed = newQuestions.map((q: Question, idx: number) => ({
          ...q,
          id: q.id && q.id.trim() ? q.id : `${stepIndex}-${idx}`,
        }));
        setQuestions(processed);
        // initialize answers
        const initial: Record<string, string> = {};
        processed.forEach(q => { initial[q.id] = ''; });
        setAnswers(initial);
      })
      .catch(err => console.error('Error loading test:', err));
  }, [roadmap, stepIndex, loadedStep, setCurrentStepIndex, setQuestions]);

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!questions.length) return;
    setIsSubmitting(true);
    try {
      // Identify knowledge gaps
      const gaps = await analyzeGaps(questions, answers);
      console.log('Identified gaps:', gaps);

      // Generate learning resources for these gaps
      const resources = await generateResources(gaps);
      console.log('Generated resources:', resources);

      setTasks(resources);
    } catch (err) {
      console.error('Test submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // After tasks are set, navigate to resources
  useEffect(() => {
    if (tasks.length > 0 && loadedStep === stepIndex) {
      router.push(`/dashboard/domain/${stepParam}/resources`);
    }
  }, [tasks, loadedStep, stepIndex, router, stepParam]);

  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  const currentStep = roadmap.roadmap[stepIndex];

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Test: {currentStep?.title}</h1>
        <button
          onClick={handleExit}
          className="text-red-500 hover:underline"
        >
          Exit
        </button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Concepts:</h2>
        <ul className="list-disc ml-5">
          {currentStep?.concepts.map((c: string, i: number) => (<li key={i}>{c}</li>))}
        </ul>
      </div>
      <div className="space-y-6">
        {questions.map((q: Question) => (
          <div key={q.id} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">{q.question}</h3>
            <textarea
              value={answers[q.id] || ''}
              onChange={e => handleAnswerChange(q.id, e.target.value)}
              className="w-full border rounded p-2 min-h-[100px]"
              placeholder="Type your answer here..."
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.values(answers).some(a => !a.trim())}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-blue-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
} 