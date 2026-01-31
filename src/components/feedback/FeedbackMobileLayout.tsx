/**
 * @file FeedbackMobileLayout.tsx
 * @description 피드백 페이지 공통 모바일 레이아웃
 *
 * Slide/Video 피드백 페이지에서 공통으로 사용하는 모바일 레이아웃입니다.
 * 슬롯 기반 설계로 각 페이지에서 필요한 콘텐츠를 주입합니다.
 */
import { type KeyboardEvent, type ReactNode, useCallback, useState } from 'react';

interface FeedbackMobileLayoutProps {
  /** 미디어 영역 (슬라이드 이미지 or 비디오) */
  mediaSlot: ReactNode;
  /** 네비게이션 영역 - optional (slide만 사용) */
  navigationSlot?: ReactNode;
  /** 리액션 영역 */
  reactionSlot: ReactNode;
  /** 대본 탭 콘텐츠 */
  scriptTabContent: ReactNode;
  /** 댓글 탭 콘텐츠 */
  commentTabContent: ReactNode;
  /** 탭에 표시할 댓글 수 */
  commentCount: number;
}

const TAB_IDS = {
  script: 'feedback-mobile-tab-script',
  comment: 'feedback-mobile-tab-comment',
} as const;

const PANEL_IDS = {
  script: 'feedback-mobile-panel-script',
  comment: 'feedback-mobile-panel-comment',
} as const;

export default function FeedbackMobileLayout({
  mediaSlot,
  navigationSlot,
  reactionSlot,
  scriptTabContent,
  commentTabContent,
  commentCount,
}: FeedbackMobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<'script' | 'comment'>('script');

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setActiveTab((prev) => {
      if (prev === 'script') return event.key === 'ArrowRight' ? 'comment' : 'script';
      return event.key === 'ArrowLeft' ? 'script' : 'comment';
    });
  }, []);

  const getTabClassName = (isActive: boolean) =>
    `flex-1 py-3 text-body-m-bold transition-colors border-b-2 ${
      isActive ? 'text-main-variant1 border-main-variant1' : 'text-black border-gray-200'
    }`;

  return (
    <div className="flex md:hidden flex-1 flex-col overflow-hidden">
      {/* 미디어 영역 */}
      <div className="shrink-0 bg-gray-400 flex items-center justify-center">{mediaSlot}</div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-h-0 flex flex-col bg-gray-100 overflow-hidden">
        <div className="px-5 shrink-0">
          {navigationSlot ? <div className="py-4">{navigationSlot}</div> : <div className="h-4" />}
          <div className="py-2">{reactionSlot}</div>
        </div>

        {/* 탭 메뉴 */}
        <div role="tablist" aria-label="대본/댓글 탭" className="flex" onKeyDown={handleTabKeyDown}>
          <button
            role="tab"
            id={TAB_IDS.script}
            aria-selected={activeTab === 'script'}
            aria-controls={PANEL_IDS.script}
            onClick={() => setActiveTab('script')}
            className={getTabClassName(activeTab === 'script')}
          >
            대본
          </button>
          <button
            role="tab"
            id={TAB_IDS.comment}
            aria-selected={activeTab === 'comment'}
            aria-controls={PANEL_IDS.comment}
            onClick={() => setActiveTab('comment')}
            className={getTabClassName(activeTab === 'comment')}
          >
            댓글 {commentCount > 0 && commentCount}
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === 'script' ? (
            <div
              id={PANEL_IDS.script}
              role="tabpanel"
              aria-labelledby={TAB_IDS.script}
              className="h-full flex flex-col"
            >
              {scriptTabContent}
            </div>
          ) : (
            <div
              id={PANEL_IDS.comment}
              role="tabpanel"
              aria-labelledby={TAB_IDS.comment}
              className="flex flex-col h-full overflow-hidden"
            >
              {commentTabContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
