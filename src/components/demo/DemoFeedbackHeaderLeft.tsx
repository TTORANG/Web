import { Logo, PresentationTitleEditor } from '@/components/common';
import { DEMO_PRESENTATION } from '@/constants/demoPresentation';

export default function DemoFeedbackHeaderLeft() {
  return (
    <>
      <Logo />
      <div className="hidden md:flex items-center gap-1.5">
        <PresentationTitleEditor
          titleOverride={DEMO_PRESENTATION.title}
          readOnlyContent={
            <div className="grid grid-cols-[4.5rem_1fr] gap-x-2 gap-y-2 text-body-s text-gray-800">
              <span className="text-gray-600 text-body-s-bold">게시자</span>
              <span className="text-gray-800 text-body-s">{DEMO_PRESENTATION.publisherName}</span>
              <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
              <span className="text-gray-800 text-body-s">{DEMO_PRESENTATION.postedAtLabel}</span>
            </div>
          }
        />
      </div>
    </>
  );
}
