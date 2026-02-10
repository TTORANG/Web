/**
 * @file SharePage.tsx
 * @description 공유 링크 진입 페이지
 *
 * shareToken으로 공유 콘텐츠를 조회한 뒤,
 * scope에 따라 슬라이드 피드백 또는 비디오 피드백 페이지로 분기합니다.
 */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { recordPageView } from '@/api/endpoints/analytics';
import { Spinner } from '@/components/common';
import { useSharedContent } from '@/hooks/queries/useShares';

import FeedbackVideoPage from './FeedbackVideoPage';

export default function SharePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data, isLoading, isError } = useSharedContent(shareToken);

  useEffect(() => {
    if (!shareToken || !data) return;

    const sentKey = `pageview:${shareToken}`;
    if (sessionStorage.getItem(sentKey) === '1') return;

    sessionStorage.setItem(sentKey, '1');

    // 공유페이지 진입시 recordPageView 조회수 늘리는 post실행
    void recordPageView({ shareToken }).catch((error) => {
      sessionStorage.removeItem(sentKey);
      console.error('[SharePage] recordPageView failed:', error);
    });
  }, [shareToken, data]);

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

  const scope = data.shareInfo.scope;

  if (scope === 'slides_script') {
    // return <FeedbackSlidePage sharedSlides={data.projectContent.slides} />; // 샌디 슬라이드페이지
  }

  return <FeedbackVideoPage sharedContent={data} />;
}
