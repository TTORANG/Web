/**
 * @file useVideoComments.ts
 * @description 영상 타임스탬프별 댓글 관리 훅
 *
 * useComments.ts와 동일한 인터페이스를 제공합니다.
 */
import { useMemo } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { CommentItem } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { showToast } from '@/utils/toast';

const EMPTY_COMMENTS: CommentItem[] = [];

export function useVideoComments() {
  const currentTimestamp = useVideoFeedbackStore((state) => state.currentTimestamp);
  const video = useVideoFeedbackStore((state) => state.video);
  const addCommentStore = useVideoFeedbackStore((state) => state.addComment);
  const addReplyStore = useVideoFeedbackStore((state) => state.addReply);
  const deleteCommentStore = useVideoFeedbackStore((state) => state.deleteComment);
  const setCommentsStore = useVideoFeedbackStore((state) => state.setComments);

  // 현재 타임스탐프의 댓글만 추출
  const flatComments = useMemo(() => {
    if (!video) return EMPTY_COMMENTS;

    const feedback = video.feedbacks.find((f) => f.timestamp === currentTimestamp);
    return feedback?.comments ?? EMPTY_COMMENTS;
  }, [video, currentTimestamp]);

  // Tree 구조로 변환 (CommentList에서 사용)
  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    return flatToTree(flatComments);
  }, [flatComments]);

  /**
   * 새 댓글 추가
   */
  const addComment = (content: string) => {
    const previousComments = flatComments ?? [];
    addCommentStore(content);

    // TODO: API 호출
    // createCommentApi(
    //   { videoId, timestamp: currentTimestamp, data: { content } },
    //   {
    //     onError: () => {
    //       setCommentsStore(previousComments);
    //       showToast.error('댓글 등록에 실패했습니다.');
    //     },
    //   },
    // );
  };

  /**
   * 답글 추가
   */
  const addReply = (parentId: string, content: string) => {
    const previousComments = flatComments ?? [];
    addReplyStore(parentId, content);

    // TODO: API 호출
  };

  /**
   * 댓글 삭제
   */
  const deleteComment = (commentId: string) => {
    const previousComments = flatComments ?? [];
    deleteCommentStore(commentId);

    // TODO: API 호출
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
