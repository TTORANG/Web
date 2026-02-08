/**
 * @file useFeedbackVideo.ts
 * @description FeedbackVideoPage의 비즈니스 로직을 담당하는 커스텀 훅
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { MOCK_SLIDES } from '@/mocks/slides';
import { MOCK_VIDEO } from '@/mocks/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { formatVideoTimestamp } from '@/utils/format';

export function useFeedbackVideo() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Store selectors
  const initVideo = useVideoFeedbackStore((s) => s.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  // Comments & Reactions
  const { comments, addComment, addReply, deleteComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  // Comment draft state
  const [commentDraft, setCommentDraft] = useState('');

  // 프로젝트 슬라이드 필터링
  const projectSlides = useMemo(() => {
    const targetProjectId = projectId ?? 'p1';
    return MOCK_SLIDES.filter((slide) => slide.projectId === targetProjectId);
  }, [projectId]);

  // 슬라이드 전환 시간 계산
  const slideChangeTimes = useMemo(() => {
    if (projectSlides.length === 0) return [];

    const videoDuration = MOCK_VIDEO.duration; // MOCK_VIDEOS → MOCK_VIDEO
    const slideCount = projectSlides.length;

    return projectSlides.map(
      (slide, i) => slide.startTime ?? Math.floor(i * (videoDuration / slideCount)),
    );
  }, [projectSlides]);

  // 타임스탬프 프리픽스 (댓글 입력 시 자동 삽입)
  const timestampPrefix = useMemo(() => `${formatVideoTimestamp(currentTime)} `, [currentTime]);

  // 댓글 추가 핸들러
  const handleAddComment = useCallback(() => {
    if (!commentDraft.trim()) return;
    addComment(commentDraft, currentTime);
    setCommentDraft('');
  }, [commentDraft, addComment, currentTime]);

  // 타임스탬프 참조로 이동
  const handleGoToTimeRef = useCallback(
    (ref: NonNullable<Comment['ref']>) => {
      if (ref.kind === 'video') requestSeek(ref.seconds);
    },
    [requestSeek],
  );

  // 비디오 초기화
  useEffect(() => {
    const timer = window.setTimeout(() => {
      initVideo(MOCK_VIDEO); // MOCK_VIDEOS → MOCK_VIDEO
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [projectId, initVideo]);

  return {
    // 상태
    isLoading,
    currentTime,
    projectSlides,
    slideChangeTimes,
    comments,
    reactions,
    commentDraft,
    timestampPrefix,

    // 액션
    updateCurrentTime,
    requestSeek,
    setCommentDraft,
    handleAddComment,
    handleGoToTimeRef,
    addReply,
    deleteComment,
    toggleReaction,

    // 비디오 URL
    webcamVideoUrl: MOCK_VIDEO.videoUrl,
  };
}

export type FeedbackVideoContext = ReturnType<typeof useFeedbackVideo>;
