import { useParams } from 'react-router-dom';

import InfoIcon from '@/assets/icons/icon-info.svg?react';
import { Popover } from '@/components/common';
import { usePresentation } from '@/hooks/queries/usePresentations';
import dayjs from '@/utils/dayjs';

export default function FeedbackHeaderCenter() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: presentation } = usePresentation(projectId ?? '');
  const title = presentation?.title?.trim() ? presentation.title : '내 발표';
  const postedAt = presentation?.updatedAt
    ? dayjs(presentation.updatedAt).format('YYYY.MM.DD HH:mm:ss')
    : '-';
  const publisherName = presentation?.userName ?? '알 수 없음';

  return (
    <div className="flex md:hidden items-center">
      <Popover
        trigger={
          <button
            type="button"
            aria-label="발표 정보 보기"
            className="inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-2 text-body-m-bold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
          >
            <span className="max-w-[40vw] truncate">{title}</span>
            <InfoIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        }
        position="bottom"
        ariaLabel="발표 정보"
        className="w-72 max-w-[90vw] rounded-2xl border border-gray-200 px-6 py-3"
      >
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-5 gap-y-3 text-body-m text-gray-800">
          <span className="text-gray-600 text-body-s-bold">게시자</span>
          <span className="text-gray-800 text-body-s">{publisherName}</span>
          <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
          <span className="text-gray-800 text-body-s">{postedAt}</span>
        </div>
      </Popover>
    </div>
  );
}
