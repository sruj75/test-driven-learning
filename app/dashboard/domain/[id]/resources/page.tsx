"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRoadmap } from '../../../../contexts/RoadmapContext';
import { parseRouteParams } from '../../../../lib/utils';

export default function DomainResourcesRedirect() {
  const router = useRouter();
  const params = useParams();
  const { milestoneParam } = parseRouteParams(params);
  
  const { roadmap } = useRoadmap();

  useEffect(() => {
    if (!roadmap) return;
    
    // Redirect to the first topic's resources in this milestone
    router.replace(`/dashboard/domain/${milestoneParam}/topic/1/resources`);
  }, [roadmap, router, milestoneParam]);

  return (
    <div className="p-8 text-center">
      <p>Redirecting to topic resources...</p>
    </div>
  );
} 