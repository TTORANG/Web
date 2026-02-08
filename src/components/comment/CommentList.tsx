/**
 * @file CommentList.tsx
 * @description 피드백 화면 우측 댓글 리스트
 *
 * 댓글 리스트 렌더링과 답글 입력 상태를 관리합니다.
 * CommentProvider로 상태를 공유하여 Comment의 props를 최소화합니다.
 */
import { useCallback, useMemo, useState } from 'react';

import { Skeleton } from '@/components/common';
import type { Comment as CommentType } from '@/types/comment';

import Comment from './Comment';
import { CommentProvider } from './CommentContext';

interface CommentListProps {
  comments: CommentType[];
  onAddReply: (targetId: string, content: string) => void;
  onGoToRef: (ref: NonNullable<CommentType['ref']>) => void;
  onDeleteComment?: (commentId: string) => void;
  onUpdateComment?: (commentId: string, content: string) => void;
  isLoading?: boolean;
}

const skeletonContentWidths = ['90%', '70%', '85%', '60%'];

export default function CommentList({
  comments,
  onAddReply,
  onGoToRef,
  onDeleteComment,
  onUpdateComment,
  isLoading = false,
}: CommentListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const submitReply = useCallback(
    (targetId: string) => {
      if (replyDraft.trim()) {
        onAddReply(targetId, replyDraft);
      }
      setReplyDraft('');
      setReplyingToId(null);
    },
    [replyDraft, onAddReply],
  );

  const toggleReply = useCallback((targetId: string) => {
    setReplyingToId((prev) => (prev === targetId ? null : targetId));
    setReplyDraft('');
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingToId(null);
    setReplyDraft('');
  }, []);

  const startEdit = useCallback((id: string, currentContent: string) => {
    setEditingId(id);
    setEditDraft(currentContent);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const submitEdit = useCallback(
    (id: string) => {
      if (editDraft.trim() && onUpdateComment) {
        onUpdateComment(id, editDraft.trim());
      }
      setEditingId(null);
      setEditDraft('');
    },
    [editDraft, onUpdateComment],
  );

  const contextValue = useMemo(
    () => ({
      replyingToId,
      replyDraft,
      setReplyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      editingId,
      editDraft,
      setEditDraft,
      startEdit,
      cancelEdit,
      submitEdit,
      deleteComment: onDeleteComment,
      goToRef: onGoToRef,
    }),
    [
      replyingToId,
      replyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      onDeleteComment,
      editingId,
      editDraft,
      startEdit,
      cancelEdit,
      submitEdit,
      onGoToRef,
    ],
  );

  if (isLoading) {
    return (
      <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
        {skeletonContentWidths.map((width, index) => (
          <div key={index} className="flex gap-3 py-3 pr-4 pl-4 bg-gray-100">
            {/* 프로필 사진 */}
            <div className="w-8 shrink-0">
              <Skeleton.Circle size={32} />
            </div>

            <div className="flex flex-1 flex-col gap-1 pt-1.5 min-w-0">
              <div className="flex flex-col gap-1">
                {/* 작성자 + 시간 */}
                <div className="flex items-center gap-2 py-1">
                  <Skeleton width={35} height={14} rounded={4} />
                  <Skeleton width={32} height={12} rounded={4} />
                </div>

                {/* 댓글 내용 */}
                <div className="py-1">
                  <Skeleton width={width} height={14} rounded={4} />
                </div>
              </div>

              {/* 답글 버튼 */}
              <div className="flex items-center py-0.5">
                <Skeleton width={40} height={12} rounded={4} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <CommentProvider value={contextValue}>
      <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} rootCommentId={comment.id} />
        ))}
      </div>
    </CommentProvider>
  );
}
