/**
 * @file FeedbackVideoPageRoute.tsx
 * @description /feedback/video/:projectId 라우트 전용 래퍼
 *
 * shareToken 기반으로 공유 콘텐츠를 로드한 후 FeedbackVideoPage에 전달합니다.
 * SharePage를 거치지 않는 직접 접근 경로를 처리합니다.
 */
import { useParams } from 'react-router-dom';

import { Spinner } from '@/components/common';
import { useFeedbackRoute } from '@/hooks/useFeedbackRoute';

import FeedbackVideoPage from './FeedbackVideoPage';

export default function FeedbackVideoPageRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const { shareToken, data, isLoading, isError, onShareExitSnapshotChange } = useFeedbackRoute();

  if (!shareToken && !projectId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        잘못된 접근입니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        공유 콘텐츠를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <FeedbackVideoPage sharedContent={data} onShareExitSnapshotChange={onShareExitSnapshotChange} />
  );
}
