/**
 * @file useFeedbackVideo.ts
 * @description FeedbackVideoPage의 비즈니스 로직을 담당하는 커스텀 훅
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { videosApi } from '@/api/endpoints/videos';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { formatVideoTimestamp } from '@/utils/format';

/**
 * 테스트용 하드코딩 비디오 ID
 * DB에서 ready 상태인 9초 영상 (id=26, project_id=136)
 */
const TEST_VIDEO_ID = 26;

export function useFeedbackVideo() {
  // projectId는 라우트에서 추출하지만 현재 테스트 모드에서는 사용하지 않음
  useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Store selectors
  const video = useVideoFeedbackStore((s) => s.video);
  const initVideo = useVideoFeedbackStore((s) => s.initVideo);
  const currentTime = useVideoFeedbackStore((s) => s.currentTime);
  const updateCurrentTime = useVideoFeedbackStore((s) => s.updateCurrentTime);
  const requestSeek = useVideoFeedbackStore((s) => s.requestSeek);

  // Comments & Reactions
  const { comments, addComment, addReply, deleteComment, updateComment } = useVideoComments();
  const { reactions, toggleReaction } = useVideoReactions();

  // Comment draft state
  const [commentDraft, setCommentDraft] = useState('');

  // TODO: 실제 API로 프로젝트 슬라이드 조회
  const projectSlides = useMemo(() => [], []);

  // TODO: 슬라이드 전환 시간 계산
  const slideChangeTimes = useMemo(() => [], []);

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

  // 비디오 초기화 - 서버 API로 실제 비디오 데이터를 가져옴
  useEffect(() => {
    let cancelled = false;

    const loadVideo = async () => {
      try {
        // 서버에서 비디오 상세 정보 조회
        const response = await videosApi.getVideoDetail(TEST_VIDEO_ID);
        if (cancelled) return;

        // 서버 응답 구조: { resultType: "SUCCESS", success: { video: {...}, timeline: {...} } }
        const successData = response.data?.success;
        const serverVideo = successData?.video ?? successData;

        // 서버 응답에서 비디오 URL 추출 (hlsMasterUrl이 실제 필드명)
        let videoUrl =
          serverVideo?.hlsMasterUrl ||
          serverVideo?.streamFileUrl ||
          serverVideo?.videoUrl ||
          serverVideo?.streamUrl ||
          serverVideo?.url ||
          serverVideo?.playbackUrl ||
          '';

        // 개발 환경에서 CDN CORS 우회를 위해 proxy 사용
        if (videoUrl && import.meta.env.DEV && videoUrl.includes('cdn.ttorang.com')) {
          videoUrl = videoUrl.replace('https://cdn.ttorang.com', '/cdn-proxy');
        }

        const videoData = {
          videoId: TEST_VIDEO_ID,
          videoUrl,
          title: serverVideo?.title || '테스트 영상',
          duration: serverVideo?.durationSeconds || serverVideo?.duration || 9,
          comments: [],
          reactionEvents: [],
          feedbacks: [],
        };

        console.log('[useFeedbackVideo] 서버 비디오 로드:', {
          videoId: TEST_VIDEO_ID,
          videoUrl,
          title: videoData.title,
          duration: videoData.duration,
          fullResponse: response.data,
        });

        initVideo(videoData);
      } catch (error) {
        console.error('[useFeedbackVideo] 비디오 로드 실패, 폴백 사용:', error);
        if (cancelled) return;

        // 서버 요청 실패 시 폴백: videoId만 실제 값 사용
        initVideo({
          videoId: TEST_VIDEO_ID,
          videoUrl: '',
          title: '테스트 영상',
          duration: 9,
          comments: [],
          reactionEvents: [],
          feedbacks: [],
        });
      } finally {
        if (!cancelled) {
          setTimeout(() => setIsLoading(false), 0);
        }
      }
    };

    loadVideo();

    return () => {
      cancelled = true;
    };
  }, [initVideo]);

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
    updateComment,
    toggleReaction,

    // 비디오 URL (서버에서 가져온 URL 사용)
    webcamVideoUrl: video?.videoUrl || '',
  };
}

export type FeedbackVideoContext = ReturnType<typeof useFeedbackVideo>;
