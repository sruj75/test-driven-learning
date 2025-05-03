'use client';
import Link from 'next/link';
import { useRoadmap } from '../contexts/RoadmapContext';

export default function DashboardPage() {
  const { roadmap, currentStepIndex } = useRoadmap();

  if (!roadmap) {
    return <div className="p-8 text-center">No roadmap found. Please return to the home page.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ul className="space-y-4">
        {roadmap.roadmap.map((step) => {
          const isCompleted = step.stepNumber - 1 < currentStepIndex;
          const isCurrent = step.stepNumber - 1 === currentStepIndex;
          return (
            <li key={step.stepNumber} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p>Estimated Days: {step.estimatedDays}</p>
                <p>Status: {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}</p>
              </div>
              <Link
                href={`/dashboard/domain/${step.stepNumber}/test`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {isCompleted ? 'Review' : isCurrent ? 'Resume' : 'Start'}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 