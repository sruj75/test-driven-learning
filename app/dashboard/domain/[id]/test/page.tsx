"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRoadmap } from '../../../../contexts/RoadmapContext';
import { parseRouteParams } from '../../../../lib/utils';

export default function DomainTestRedirect() {
  const router = useRouter();
  const params = useParams();
  const { milestoneParam } = parseRouteParams(params);
  
  const { roadmap } = useRoadmap();

  useEffect(() => {
    if (!roadmap) return;
    
    // Redirect to the first topic's test in this milestone
    router.replace(`/dashboard/domain/${milestoneParam}/topic/1/test`);
  }, [roadmap, router, milestoneParam]);

  return (
    <div className="p-8 text-center">
      <p>Redirecting to topic test...</p>
    </div>
  );
} 