import InfoIcon from '@/assets/icons/icon-info.svg?react';
import { Popover } from '@/components/common';
import { DEMO_PRESENTATION } from '@/constants/demoPresentation';

export default function DemoFeedbackHeaderCenter() {
  return (
    <div className="flex md:hidden items-center gap-1.5">
      <h1 className="text-body-m-bold text-gray-800 max-w-50 truncate">
        {DEMO_PRESENTATION.title}
      </h1>
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
        align="end"
        ariaLabel="발표 정보"
        className="w-64 max-w-[90vw] rounded-xl border border-gray-200 bg-white px-4 py-3"
      >
        <div className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-2">
          <span className="text-gray-600 text-body-s-bold">게시자</span>
          <span className="text-gray-800 text-body-s">{DEMO_PRESENTATION.publisherName}</span>
          <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
          <span className="text-gray-800 text-body-s">{DEMO_PRESENTATION.postedAtLabel}</span>
        </div>
      </Popover>
    </div>
  );
}
