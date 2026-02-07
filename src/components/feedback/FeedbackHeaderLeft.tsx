import { useParams } from 'react-router-dom';

import { Logo, PresentationTitleEditor } from '@/components/common';
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
      <PresentationTitleEditor
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
