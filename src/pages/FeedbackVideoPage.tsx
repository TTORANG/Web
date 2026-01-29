import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import { CommentInput } from '@/components/comment';
import CommentList from '@/components/comment/CommentList';
import { Spinner } from '@/components/common';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import ScriptSection from '@/components/feedback/ScriptSection';
import SlideWebcamStage from '@/components/feedback/SlideWebcamStage';
import { MOCK_SLIDES } from '@/mocks/slides';
import { MOCK_VIDEO } from '@/mocks/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { formatVideoTimestamp } from '@/utils/format';

import { useVideoComments } from '../hooks/useVideoComments';
import { useVideoReactions } from '../hooks/useVideoReactions';

export default function FeedbackVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const initVideo = useVideoFeedbackStore((state) => state.initVideo);

  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  const [commentDraft, setCommentDraft] = useState('');
  const [mobileTab, setMobileTab] = useState<'script' | 'comment'>('script');
  const tabIds = {
    script: 'feedback-video-tab-script',
    comment: 'feedback-video-tab-comment',
  } as const;
  const panelIds = {
    script: 'feedback-video-panel-script',
    comment: 'feedback-video-panel-comment',
  } as const;

  // URL의 projectId를 활용해 해당 프로젝트 슬라이드만 필터링
  const projectSlides = useMemo(() => {
    const targetProjectId = `p${projectId ?? '1'}`;
    return MOCK_SLIDES.filter((slide) => slide.projectId === targetProjectId);
  }, [projectId]);

  // 해당 프로젝트 슬라이드의 전환 시간 계산 (영상 길이 기준, 개발 단계에서)
  const slideChangeTimes = useMemo(() => {
    const videoDuration = MOCK_VIDEO.duration;
    const slideCount = projectSlides.length;
    if (slideCount === 0) return [];
    return Array.from({ length: slideCount }).map((_, i) =>
      Math.floor(i * (videoDuration / slideCount)),
    );
  }, [projectSlides.length]);

  // 현재 재생 시간을 타임스탬프 문자열로 변환 (포커스 시 자동 삽입용)
  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft);
    setCommentDraft('');
  };

  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setMobileTab((prev) => {
      if (prev === 'script') return event.key === 'ArrowRight' ? 'comment' : 'script';
      return event.key === 'ArrowLeft' ? 'script' : 'comment';
    });
  }, []);

  const getTabClassName = (isActive: boolean) =>
    clsx(
      'flex-1 py-3 max-[350px]:py-2 text-body-m-bold max-[350px]:text-body-s transition-colors',
      isActive ? 'text-main border-b-2 border-main-variant1' : 'text-gray-600',
    );

  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  // 비디오 초기화
  useEffect(() => {
    const timer = window.setTimeout(() => {
      initVideo(MOCK_VIDEO);
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [projectId, initVideo]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="hidden md:flex flex-1 px-35">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          {/* 슬라이드 + 웹캠 + 재생바 (오버레이) */}
          <SlideWebcamStage
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            webcamVideoUrl={MOCK_VIDEO.videoUrl}
            onTimeUpdate={setCurrentTime}
          />

          {/* 대본 섹션 */}
          <ScriptSection
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            currentTime={currentTime}
          />
        </div>

        <aside className="w-96 shrink-0 bg-gray-100 flex flex-col border-l border-gray-200">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CommentList
              comments={comments}
              onAddReply={addReply}
              onGoToRef={handleGoToTimeRef}
              onDeleteComment={deleteComment}
            />
          </div>

          <div className="shrink-0 border-t border-black/5 flex flex-col gap-6 px-4 pb-6 pt-2">
            <CommentInput
              value={commentDraft}
              onChange={setCommentDraft}
              onSubmit={handleAddComment}
              onCancel={() => setCommentDraft('')}
              className="items-end w-86"
              initialValueOnFocus={timestampPrefix}
            />
            <ReactionButtons reactions={reactions} onToggleReaction={toggleReaction} />
          </div>
        </aside>
      </div>

      {/** 모바일 */}
      <div className="flex md:hidden flex-1 flex-col bg-gray-100 min-w-0">
        <div className="pt-4 max-[350px]:pb-3">
          <SlideWebcamStage
            slides={projectSlides}
            slideChangeTimes={slideChangeTimes}
            webcamVideoUrl={MOCK_VIDEO.videoUrl}
            onTimeUpdate={setCurrentTime}
            disablePip
            showLayoutToggle // 웹캠·슬라이드 전환 버튼 생성(모바일에만)
          />
        </div>

        <div className="shrink-0 px-4 pb-3 pt-5 flex flex-col gap-2 max-[350px]:px-3 max-[350px]:pb-2 max-[350px]:pt-1">
          <ReactionButtons
            reactions={reactions}
            onToggleReaction={toggleReaction}
            showLabel={false}
            className="w-full flex-nowrap justify-between"
            buttonClassName="flex-1 min-w-0 max-[350px]:text-xs max-[350px]:py-1"
          />
        </div>

        <div
          role="tablist"
          aria-label="대본/댓글 탭"
          className="flex border-b border-gray-200"
          onKeyDown={handleTabKeyDown}
        >
          <button
            role="tab"
            id={tabIds.script}
            aria-selected={mobileTab === 'script'}
            aria-controls={panelIds.script}
            onClick={() => setMobileTab('script')}
            className={getTabClassName(mobileTab === 'script')}
          >
            대본
          </button>
          <button
            role="tab"
            id={tabIds.comment}
            aria-selected={mobileTab === 'comment'}
            aria-controls={panelIds.comment}
            onClick={() => setMobileTab('comment')}
            className={getTabClassName(mobileTab === 'comment')}
          >
            댓글 {comments.length > 0 && `${comments.length}`}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'script' ? (
            <div
              id={panelIds.script}
              role="tabpanel"
              aria-labelledby={tabIds.script}
              className="px-4 py-4 max-[350px]:px-3 max-[350px]:py-3"
            >
              <ScriptSection
                slides={projectSlides}
                slideChangeTimes={slideChangeTimes}
                currentTime={currentTime}
              />
            </div>
          ) : (
            <div
              id={panelIds.comment}
              role="tabpanel"
              aria-labelledby={tabIds.comment}
              className="flex flex-col min-h-full"
            >
              <div className="flex-1">
                <CommentList
                  comments={comments}
                  onAddReply={addReply}
                  onGoToRef={handleGoToTimeRef}
                  onDeleteComment={deleteComment}
                />
              </div>
              <div className="sticky bottom-0 border-t border-gray-200 bg-gray-100 px-4 py-3 max-[350px]:px-3 max-[350px]:py-2">
                <CommentInput
                  value={commentDraft}
                  onChange={setCommentDraft}
                  onSubmit={handleAddComment}
                  onCancel={() => setCommentDraft('')}
                  className="w-full"
                  initialValueOnFocus={timestampPrefix}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
