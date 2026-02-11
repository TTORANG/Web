/**
 * @file CommentReplies.tsx
 * @description 답글 로딩/렌더링 컴포넌트
 *
 * 서버에서 답글을 무한 스크롤로 로드하고, 낙관적 답글과 병합합니다.
 * 추가 페이지가 있으면 "답글 더 보기" 버튼을 표시합니다.
 */
import { useMemo } from 'react';

import { useCommentRepliesInfiniteQuery } from '@/hooks/queries/useCommentRepliesQuery';
import type { Comment as CommentType } from '@/types/comment';

import Comment from './Comment';

interface CommentRepliesProps {
  /** 부모 댓글의 서버 ID (답글 API 호출용) */
  serverId?: string;
  /** Zustand flatToTree 결과의 낙관적 답글 */
  localReplies: CommentType[];
  /** 최상위 부모 댓글 ID */
  rootCommentId: string;
}

export default function CommentReplies({
  serverId,
  localReplies,
  rootCommentId,
}: CommentRepliesProps) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCommentRepliesInfiniteQuery(serverId);

  // 서버 답글 + 낙관적 답글 병합
  const mergedReplies = useMemo(() => {
    const serverReplies = data?.replies ?? [];
    const serverIds = new Set(serverReplies.map((r) => r.serverId));

    // 낙관적 답글 = serverId가 없거나 서버에서 아직 반환되지 않은 답글
    const optimisticOnly = localReplies.filter((r) => !r.serverId || !serverIds.has(r.serverId));

    const combined = [...serverReplies, ...optimisticOnly];

    // 답글을 작성시간 기준 내림차순 정렬 (최신 답글이 위로)
    combined.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    return combined;
  }, [data?.replies, localReplies]);

  if (mergedReplies.length === 0 && !hasNextPage) return null;

  return (
    <div>
      {mergedReplies.map((reply, index) => (
        <Comment
          key={reply.commentId ?? `reply-${rootCommentId}-${index}`}
          comment={reply}
          isIndented
          rootCommentId={rootCommentId}
        />
      ))}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-2 pl-15 text-left text-caption-bold text-main hover:text-main-variant1 active:text-main-variant2 disabled:text-gray-400"
        >
          {isFetchingNextPage ? '로딩 중...' : '답글 더 보기'}
        </button>
      )}
    </div>
  );
}
