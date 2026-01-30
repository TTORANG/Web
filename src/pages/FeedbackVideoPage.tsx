/**
 * @file FeedbackVideoPage.tsx
 * @description 비디오 피드백 페이지 - 데스크톱/모바일 뷰 분기 담당
 */
import FeedbackVideoDesktop from '@/components/feedback/video/FeedbackVideoDesktop';
import FeedbackVideoMobile from '@/components/feedback/video/FeedbackVideoMobile';
import { useFeedbackVideo } from '@/hooks/useFeedbackVideo';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export default function FeedbackVideoPage() {
  const isDesktop = useIsDesktop();
  const ctx = useFeedbackVideo();

  return (
    <div className="flex h-full w-full">
      {isDesktop ? <FeedbackVideoDesktop ctx={ctx} /> : <FeedbackVideoMobile ctx={ctx} />}
    </div>
  );
}
