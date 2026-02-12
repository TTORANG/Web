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

type UseVideoCommentsOptions = {
  onMutationSuccess?: () => void;
};

/**
 * 영상 댓글 관리 훅
 *
 * video.feedbacks 전체에서 댓글을 합산하여 트리 구조로 반환합니다.
 * mutation 성공 시 onMutationSuccess 콜백을 호출하여 최신 데이터를 반영합니다.
 *
 * @returns comments - 트리 구조 댓글 목록
 * @returns addComment - 새 댓글 추가 (타임스탬프 지정)
 * @returns addReply - 답글 추가
 * @returns deleteComment - 댓글 삭제
 */
export function useVideoComments(options?: UseVideoCommentsOptions) {
  const video = useVideoFeedbackStore((state) => state.video);
  const videoId = video?.videoId;

  const deleteCommentStore = useVideoFeedbackStore((state) => state.deleteComment);
  const updateCommentStore = useVideoFeedbackStore((state) => state.updateComment);

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
   * @returns 서버에서 받은 댓글 ID (스크롤용)
   */
  const addComment = async (content: string, seconds: number): Promise<string | null> => {
    if (!videoId) {
      showToast.error('영상 정보를 찾을 수 없습니다.');
      return null;
    }

    try {
      // content에서 타임스탬프 제거 (있으면)
      const extracted = extractTimestampFromComment(content);
      const contentToSend = extracted ? extracted.content : content;

      // 서버 API 호출 (초를 밀리초로 변환)
      const model = await createVideoComment(videoId, {
        content: contentToSend,
        timestampMs: Math.floor(seconds * 1000),
      });

      // 서버에서 받은 commentId 반환
      if (model?.serverId) {
        return model.serverId;
      }

      return null;
    } catch {
      showToast.error('댓글을 등록하지 못했습니다.', '잠시 후 다시 시도해주세요.');
      return null;
    }
  };

  /**
   * 답글 추가
   */
  const addReply = async (parentId: string, content: string) => {
    try {
      // parentId로 부모 댓글 찾기 (serverId 필요)
      const allComments = video?.feedbacks.flatMap((f) => f.comments) || [];
      const parentComment = allComments.find((c) => c.commentId === parentId);
      const parentServerId = parentComment ? getServerCommentId(parentComment) : null;

      if (!parentComment) {
        showToast.error('답글을 등록하지 못했습니다.', '원본 댓글을 찾을 수 없습니다.');
        return;
      }

      // content에서 타임스탬프 제거 (있으면)
      const extracted = extractTimestampFromComment(content);
      const contentToSend = extracted ? extracted.content : content;

      if (!parentServerId) {
        showToast.error('답글을 등록하지 못했습니다.', '댓글 정보를 확인해주세요.');
        return;
      }
      await createCommentReply(parentServerId, { content: contentToSend });
      options?.onMutationSuccess?.();
    } catch {
      showToast.error('답글을 등록하지 못했습니다.', '잠시 후 다시 시도해주세요.');
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

    try {
      await deleteVideoComment(targetServerId);
      showToast.success('댓글을 삭제했습니다.');
      options?.onMutationSuccess?.();
    } catch {
      showToast.error('댓글을 삭제하지 못했습니다.', '잠시 후 다시 시도해주세요.');
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
      updateCommentStore(commentId, content);
      return;
    }

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
      showToast.success('댓글을 수정했습니다.');
      options?.onMutationSuccess?.();
    } catch {
      showToast.error('댓글을 수정하지 못했습니다.', '잠시 후 다시 시도해주세요.');
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
