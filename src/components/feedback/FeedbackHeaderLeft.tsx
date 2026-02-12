import { Logo, PresentationTitleEditor } from '@/components/common';
import { useFeedbackHeaderInfo } from '@/hooks/useFeedbackHeaderInfo';

export default function FeedbackHeaderLeft() {
  const { title, postedAt, publisherName } = useFeedbackHeaderInfo();

  return (
    <>
      <Logo />
      <PresentationTitleEditor
        titleOverride={title}
        readOnlyContent={
          <div className="grid grid-cols-[6.5rem_1fr] gap-x-5 gap-y-3 text-body-m text-gray-800">
            <span className="text-gray-600 text-body-s-bold">게시자</span>
            <span className="text-gray-800 text-body-s">{publisherName}</span>
            <span className="text-gray-600 text-body-s-bold">게시 날짜</span>
            <span className="text-gray-800 text-body-s">{postedAt}</span>
          </div>
        }
      />
    </>
  );
}
