import { useParams, useSearchParams } from 'react-router-dom';

import InfoIcon from '@/assets/icons/icon-info.svg?react';
import { Popover } from '@/components/common';
import { useSharedContent } from '@/hooks/queries/useShares';
import dayjs from '@/utils/dayjs';

export default function FeedbackHeaderCenter() {
  const { shareToken: shareTokenFromPath } = useParams<{ shareToken: string }>();
  const [searchParams] = useSearchParams();
  const shareTokenFromQuery = searchParams.get('shareToken');

  // 경로 파라미터 우선, 없으면 쿼리 파라미터 사용
  const shareToken = shareTokenFromPath || shareTokenFromQuery || '';

  const { data: sharedContent, isLoading, isError } = useSharedContent(shareToken || undefined);

  // 로딩 중일 때는 로딩 표시
  if (isLoading) {
    return (
      <div className="flex md:hidden items-center">
        <div className="h-7 w-32 animate-pulse rounded-md bg-gray-700" />
      </div>
    );
  }

  // 에러 발생 시 기본 UI 표시
  if (isError || !sharedContent) {
    return (
      <div className="flex md:hidden items-center">
        <span className="text-body-m-bold text-gray-400">발표 정보를 불러올 수 없습니다</span>
      </div>
    );
  }

  // 공유 콘텐츠에서 발표 정보 추출
  const title = sharedContent.projectContent.title;
  const publisherName = sharedContent.sessionInfo.name;
  const postedAt = dayjs(sharedContent.shareInfo.createdAt).format('YYYY.MM.DD HH:mm:ss');

  return (
    <div className="flex md:hidden items-center gap-1.5">
      <h1 className="text-body-m-bold text-gray-800 max-w-50 truncate">{title}</h1>
      <Popover
        trigger={
          <button
            type="button"
            aria-label="발표 정보"
            className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
          >
            <InfoIcon className="h-4 w-4 text-gray-800" aria-hidden="true" />
          </button>
        }
        position="bottom"
        align="start"
        ariaLabel="발표 정보"
        className="w-64 max-w-90 rounded-2xl border border-gray-200 bg-white! px-5 py-4"
      >
        <div className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-3">
          <span className="text-gray-600 text-body-s-bold">게시자</span>
          <span className="text-gray-800 text-body-s">{publisherName}</span>
          <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
          <span className="text-gray-800 text-body-s">{postedAt}</span>
        </div>
      </Popover>
    </div>
  );
}
