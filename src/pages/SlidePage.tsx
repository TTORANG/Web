import { useParams } from 'react-router-dom';

import { DEFAULT_SLIDE_ID } from '@/constants/navigation';

export default function SlidePage() {
  const { slideId = DEFAULT_SLIDE_ID } = useParams<{ slideId: string }>();

  return (
    <div role="tabpanel" id="tabpanel-slide" aria-labelledby="tab-slide" className="p-8">
      <h1 className="text-body-m-bold">슬라이드 {slideId}</h1>
    </div>
  );
}
