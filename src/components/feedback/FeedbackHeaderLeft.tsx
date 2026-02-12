import { Logo, PresentationTitleEditor } from '@/components/common';
import { useFeedbackHeaderInfo } from '@/hooks/useFeedbackHeaderInfo';

export default function FeedbackHeaderLeft() {
  const { title, postedAt, publisherName, isLoading, isError } = useFeedbackHeaderInfo();

  // 로딩 중일 때는 로딩 표시
  if (isLoading) {
    return (
      <>
        <Logo />
        <div className="hidden md:flex items-center gap-1.5">
          <div className="h-7 w-32 animate-pulse rounded-md bg-gray-700" />
        </div>
      </>
    );
  }

  // 에러 발생 시 기본 UI 표시
  if (isError) {
    return (
      <>
        <Logo />
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-body-m-bold text-gray-400">발표 정보를 불러올 수 없습니다</span>
        </div>
      </>
    );
  }

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
