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
  isLoading?: boolean;
}

// 스켈레톤 아이템 - 댓글 내용 너비 변화
const skeletonContentWidths = ['90%', '70%', '85%', '60%'];

export default function CommentList({
  comments,
  onAddReply,
  onGoToRef,
  onDeleteComment,
  isLoading = false,
}: CommentListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

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

  const contextValue = useMemo(
    () => ({
      replyingToId,
      replyDraft,
      setReplyDraft,
      toggleReply,
      submitReply,
      cancelReply,
      deleteComment: onDeleteComment,
      goToRef: onGoToRef,
    }),
    [replyingToId, replyDraft, toggleReply, submitReply, cancelReply, onDeleteComment, onGoToRef],
  );

  // 스켈레톤 렌더링 (로딩 시)
  if (isLoading) {
    return (
      <div className="mt-2 flex-1 space-y-5 overflow-y-auto">
        {skeletonContentWidths.map((width, index) => (
          <div key={index} className="flex gap-3 py-3 pr-4 pl-4 bg-gray-100">
            {/* 아바타 wrapper (w-8 shrink-0) */}
            <div className="w-8 shrink-0">
              <Skeleton.Circle size={32} />
            </div>

            {/* 콘텐츠 영역 (flex flex-1 flex-col gap-1 pt-1.5 min-w-0) */}
            <div className="flex flex-1 flex-col gap-1 pt-1.5 min-w-0">
              <div className="flex flex-col gap-4">
                {/* 작성자 + 시간 (flex items-center gap-2) */}
                <div className="flex items-center gap-2">
                  <Skeleton width={40} height={16} rounded={4} />
                  <Skeleton width={30} height={12} rounded={4} />
                </div>

                {/* 댓글 내용 (text-body-s) */}
                <Skeleton width={width} height={14} rounded={4} />
              </div>

              {/* 답글 버튼 (flex items-center) */}
              <div className="flex items-center">
                <Skeleton width={36} height={12} rounded={4} />
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
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </CommentProvider>
  );
}
