import { useParams } from 'react-router-dom';

import InfoIcon from '@/assets/icons/icon-info.svg?react';
import { Logo, Popover, PresentationTitleEditor } from '@/components/common';
import { usePresentation } from '@/hooks/queries/usePresentations';
import dayjs from '@/utils/dayjs';

export default function FeedbackHeaderLeft() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: presentation } = usePresentation(projectId ?? '');
  const postedAt = presentation?.updatedAt
    ? dayjs(presentation.updatedAt).format('YYYY.MM.DD HH:mm:ss')
    : '-';
  const publisherName = presentation?.userName ?? '알 수 없음';

  return (
    <>
      <Logo />
      <div className="flex items-center gap-3">
        <PresentationTitleEditor readOnly />
        <Popover
          trigger={
            <button
              type="button"
              aria-label="발표 정보"
              className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-main"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          }
          position="bottom"
          align="start"
          ariaLabel="발표 정보"
          className="w-72 max-w-[90vw] -translate-x-30 md:translate-x-0 rounded-2xl border border-gray-200 px-6 py-3"
        >
          <div className="grid grid-cols-[6.5rem_1fr] gap-x-5 gap-y-3 text-body-m text-gray-800">
            <span className="text-gray-600 text-body-s-bold">게시자</span>
            <span className="text-gray-800 text-body-s">{publisherName}</span>
            <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
            <span className="text-gray-800 text-body-s">{postedAt}</span>
          </div>
        </Popover>
      </div>
    </>
  );
}
