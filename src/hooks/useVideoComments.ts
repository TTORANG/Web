import { useMemo } from 'react';

import { updateComment as updateCommentApi } from '@/api/endpoints/comments';
import { createCommentReply, createVideoComment, deleteVideoComment } from '@/api/endpoints/videos';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { Comment } from '@/types/comment';
import { flatToTree } from '@/utils/comment';
import { extractTimestampFromComment } from '@/utils/format';
import { showToast } from '@/utils/toast';

const EMPTY_COMMENTS: Comment[] = [];

function getServerCommentId(comment: Comment): string | null {
  if (comment.serverId?.trim()) return comment.serverId;
  if (!comment.isMine && comment.commentId.trim()) return comment.commentId;
  return null;
}

/**
 * 영상 댓글 관리 훅
 *
 * video.feedbacks 전체에서 댓글을 합산하여 트리 구조로 반환합니다.
 *
 * @returns comments - 트리 구조 댓글 목록
 * @returns addComment - 새 댓글 추가 (타임스탬프 지정)
 * @returns addReply - 답글 추가
 * @returns deleteComment - 댓글 삭제
 */
export function useVideoComments() {
  const video = useVideoFeedbackStore((state) => state.video);
  const videoId = video?.videoId;

  const addCommentStore = useVideoFeedbackStore((state) => state.addComment);
  const addReplyStore = useVideoFeedbackStore((state) => state.addReply);
  const deleteCommentStore = useVideoFeedbackStore((state) => state.deleteComment);
  const updateCommentStore = useVideoFeedbackStore((state) => state.updateComment);
  const updateCommentServerId = useVideoFeedbackStore((state) => state.updateCommentServerId);

  // 전체 feedbacks의 comments를 합쳐서 반환
  const flatComments = useMemo(() => {
    if (!video) return EMPTY_COMMENTS;

    // 모든 타임스탬프의 댓글을 하나로 합침
    const merged = video.feedbacks.flatMap((f) => f.comments);

    // 영상 타임스탬프 기준 오름차순 정렬 (타임스탬프가 앞쪽인 댓글이 위에 위치)
    merged.sort((a, b) => {
      const aSeconds = a.ref?.kind === 'video' ? a.ref.seconds : 0;
      const bSeconds = b.ref?.kind === 'video' ? b.ref.seconds : 0;
      return aSeconds - bSeconds;
    });

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
   * @param content - 댓글 내용
   * @param seconds - 댓글이 달릴 영상 타임스탬프 (초)
   * @returns 생성된 댓글 ID (스크롤용)
   */
  const addComment = async (content: string, seconds: number): Promise<string | null> => {
    if (!videoId) {
      showToast.error('비디오 정보를 찾을 수 없습니다.');
      return null;
    }

    // Optimistic update
    const tempComment = addCommentStore(content, seconds);

    try {
      // content에서 타임스탬프 제거 (있으면)
      const extracted = extractTimestampFromComment(content);
      const contentToSend = extracted ? extracted.content : content;

      // 서버 API 호출 (초를 밀리초로 변환)
      const model = await createVideoComment(videoId, {
        content: contentToSend,
        timestampMs: Math.floor(seconds * 1000),
      });

      // 서버 ID 저장 (Model에서 serverId 추출)
      if (model && tempComment) {
        updateCommentServerId(tempComment.commentId, model.serverId);
      }
    } catch {
      showToast.error('댓글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    }

    return tempComment?.commentId ?? null;
  };

  /**
   * 답글 추가
   */
  const addReply = async (parentId: string, content: string) => {
    const tempReply = addReplyStore(parentId, content);

    try {
      // parentId로 부모 댓글 찾기 (serverId 필요)
      const allComments = video?.feedbacks.flatMap((f) => f.comments) || [];
      const parentComment = allComments.find((c) => c.commentId === parentId);
      const parentServerId = parentComment ? getServerCommentId(parentComment) : null;

      if (!parentComment) {
        showToast.error('답글 등록에 실패했습니다.', '부모 댓글을 찾을 수 없습니다.');
        return;
      }

      // content에서 타임스탬프 제거 (있으면)
      const extracted = extractTimestampFromComment(content);
      const contentToSend = extracted ? extracted.content : content;

      if (!parentServerId) {
        showToast.error('답글 등록에 실패했습니다.', '잘못된 댓글 ID입니다.');
        return;
      }
      const model = await createCommentReply(parentServerId, { content: contentToSend });

      // 서버 ID 저장 (Model에서 serverId 추출)
      if (model && tempReply) {
        updateCommentServerId(tempReply.commentId, model.serverId);
      }
    } catch {
      showToast.error('답글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  /**
   * 댓글 삭제
   */
  const deleteComment = async (commentId: string) => {
    if (!video) {
      return;
    }

    // 플랫 구조: 모든 댓글(답글 포함)이 같은 배열에 있음
    const allComments = video.feedbacks.flatMap((f) => f.comments);
    const targetComment = allComments.find((c) => c.commentId === commentId);
    const targetServerId = targetComment ? getServerCommentId(targetComment) : null;

    if (!targetComment) {
      showToast.error('댓글을 찾을 수 없습니다.');
      return;
    }

    // serverId가 없으면 로컬에서만 삭제 (아직 서버에 저장되지 않음)
    if (!targetServerId) {
      deleteCommentStore(commentId);
      return;
    }

    // Optimistic update
    deleteCommentStore(commentId);

    try {
      await deleteVideoComment(targetServerId);
      showToast.success('댓글이 삭제되었습니다.');
    } catch {
      showToast.error('댓글 삭제에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  /**
   * 댓글 수정
   */
  const updateComment = async (commentId: string, content: string) => {
    if (!video) return;

    const allComments = video.feedbacks.flatMap((f) => f.comments);
    const targetComment = allComments.find((c) => c.commentId === commentId);

    if (!targetComment) {
      showToast.error('댓글을 찾을 수 없습니다.');
      return;
    }

    if (!targetComment.serverId) {
      showToast.error('서버에 저장되지 않은 댓글은 수정할 수 없습니다.');
      return;
    }

    // Optimistic update
    updateCommentStore(commentId, content);

    try {
      // content에서 타임스탬프 제거 (있으면)
      const extracted = extractTimestampFromComment(content);
      const contentToSend = extracted ? extracted.content : content;

      // 서버 API 호출 (serverId를 number로 변환)
      const commentIdNum = parseInt(targetComment.serverId, 10);
      if (isNaN(commentIdNum)) {
        throw new Error('Invalid comment server ID');
      }
      await updateCommentApi(String(commentIdNum), { content: contentToSend });
      showToast.success('댓글이 수정되었습니다.');
    } catch {
      showToast.error('댓글 수정에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    }
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
    updateComment,
  };
}
