/**
 * @file useVideoComments.ts
 * @description 영상 댓글 관리 훅
 *
 * - "현재 타임스탬프의 댓글만" 추출하던 방식 제거
 * - video.feedbacks 전체에서 댓글을 모두 합쳐서 반환
 * - CommentList 재사용을 위해 Tree 변환은 그대로 유지(flatToTree)
 */
import { useMemo } from 'react';

import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { CommentItem } from '@/types/comment';
import { flatToTree } from '@/utils/comment';

const EMPTY_COMMENTS: CommentItem[] = [];

export function useVideoComments() {
  const video = useVideoFeedbackStore((state) => state.video);

  const addCommentStore = useVideoFeedbackStore((state) => state.addComment);
  const addReplyStore = useVideoFeedbackStore((state) => state.addReply);
  const deleteCommentStore = useVideoFeedbackStore((state) => state.deleteComment);

  // CHANGED: 전체 feedbacks의 comments를 합쳐서 반환
  const flatComments = useMemo(() => {
    if (!video) return EMPTY_COMMENTS;

    // 모든 타임스탬프의 댓글을 하나로 합침
    const merged = video.feedbacks.flatMap((f) => f.comments);

    // 정렬(선택): 최신 댓글이 위로 오게 하고 싶으면 아래처럼
    // createComment()가 timestamp를 ISO로 넣는 구조라 문자열 비교 가능
    merged.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    return merged;
  }, [video]);

  // Tree 구조로 변환 (CommentList에서 사용)
  const comments = useMemo(() => {
    if (!flatComments) return EMPTY_COMMENTS;
    return flatToTree(flatComments);
  }, [flatComments]);

  /**
   * 새 댓글 추가
   *
   * NOTE:
   * - "어디 타임스탬프에 추가되냐"는 store.currentTimestamp 기준(기존 로직 유지)
   * - 즉 댓글창은 전체 노출이지만, 새 댓글은 "현재 영상 위치"에 기록됨
   */
  const addComment = (content: string) => {
    addCommentStore(content);
  };

  /**
   * 답글 추가
   */
  const addReply = (parentId: string, content: string) => {
    addReplyStore(parentId, content);
  };

  /**
   * 댓글 삭제
   */
  const deleteComment = (commentId: string) => {
    deleteCommentStore(commentId);
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
