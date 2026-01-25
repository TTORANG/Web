import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import InfoIcon from '@/assets/icons/icon-info.svg?react';
import { Logo, Popover } from '@/components/common';
import { MOCK_PROJECTS } from '@/mocks/projects';
import dayjs from '@/utils/dayjs';

const DEFAULT_PUBLISHER = '익명의 바다거북이';

export default function FeedbackHeaderLeft() {
  const { projectId } = useParams<{ projectId: string }>();

  const { publisher, postedAt } = useMemo(() => {
    const project = MOCK_PROJECTS.find((item) => item.id === projectId);
    const date = project?.updatedAt;
    return {
      publisher: DEFAULT_PUBLISHER,
      postedAt: date ? dayjs(date).format('YYYY.MM.DD HH:mm:ss') : '-',
    };
  }, [projectId]);

  return (
    <>
      <Logo />
      <div className="flex items-center gap-3">
        <span className="text-body-m-bold text-black">발표 피드백</span>
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
            <span className="text-gray-600 text-s-bold">게시자</span>
            <span className="text-gray-800 text-body-s">{publisher}</span>
            <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
            <span className="text-gray-800 text-body-s">{postedAt}</span>
          </div>
        </Popover>
      </div>
    </>
  );
}
