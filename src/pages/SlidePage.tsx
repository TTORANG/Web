import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { DEFAULT_SLIDE_ID, setLastSlideId } from '@/constants/navigation';

export default function SlidePage() {
  const { projectId = '', slideId = DEFAULT_SLIDE_ID } = useParams<{
    projectId: string;
    slideId: string;
  }>();

  useEffect(() => {
    if (projectId && slideId) {
      setLastSlideId(projectId, slideId);
    }
  }, [projectId, slideId]);

  return (
    <div role="tabpanel" id="tabpanel-slide" aria-labelledby="tab-slide" className="p-8">
      <h1 className="text-body-m-bold">슬라이드 {slideId}</h1>
    </div>
  );
}
