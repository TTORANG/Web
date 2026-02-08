import type { Comment, CreateCommentInput } from '@/types/comment';

/**
 * 고유 ID 생성
 */
export function generateCommentId(): string {
  return crypto.randomUUID();
}

/**
 * 새 댓글 객체 생성
 */
export function createComment(input: CreateCommentInput): Comment {
  const isReply = Boolean(input.parentId);

  return {
    commentId: generateCommentId(),
    userId: input.userId ?? 'unknown',
    content: input.content.trim(),
    createdAt: new Date().toISOString(),
    isMine: true,
    ref: input.ref,
    isReply,
    parentId: input.parentId,
    replies: isReply ? undefined : [],
  };
}

/**
 * 플랫 배열에 답글 추가 (부모 댓글 바로 다음 위치에 삽입)
 *
 * SlidePage(Opinion) 방식: 플랫 배열 + parentId 참조
 */
export function addReplyToFlat(
  comments: Comment[],
  parentId: string,
  input: Omit<CreateCommentInput, 'parentId'>,
): Comment[] {
  const newReply = createComment({ ...input, parentId });

  const parentIndex = comments.findIndex((c) => c.commentId === parentId);
  if (parentIndex === -1) return comments;

  const result = [...comments];
  result.splice(parentIndex + 1, 0, newReply);
  return result;
}

/**
 * 플랫 배열에서 특정 댓글의 content를 업데이트
 */
export function updateInFlat(comments: Comment[], targetId: string, content: string): Comment[] {
  return comments.map((c) => (c.commentId === targetId ? { ...c, content } : c));
}

/**
 * 플랫 배열에서 댓글 삭제 (부모 삭제 시 자식도 함께 삭제)
 */
export function deleteFromFlat(comments: Comment[], targetId: string): Comment[] {
  return comments.filter((c) => c.commentId !== targetId && c.parentId !== targetId);
}

/**
 * 플랫 배열을 트리 구조로 변환
 *
 * parentId를 기반으로 replies 중첩 구조로 변환합니다.
 */
export function flatToTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  // 1. 모든 댓글을 맵에 저장 (replies 초기화)
  for (const comment of comments) {
    map.set(comment.commentId, { ...comment, replies: [] });
  }

  // 2. 부모-자식 관계 연결
  for (const comment of comments) {
    const node = map.get(comment.commentId)!;
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies!.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}
