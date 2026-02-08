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
    id: generateCommentId(),
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
): { comments: Comment[]; newComment: Comment } {
  const newReply = createComment({ ...input, parentId });

  const parentIndex = comments.findIndex((c) => c.id === parentId);
  if (parentIndex === -1) return { comments, newComment: newReply };

  const result = [...comments];
  result.splice(parentIndex + 1, 0, newReply);
  return { comments: result, newComment: newReply };
}

/**
 * 중첩 배열에 답글 추가 (부모의 replies 배열에 추가)
 *
 * FeedbackSlidePage(Comment) 방식: 중첩 배열 구조
 */
export function addReplyToTree(
  comments: Comment[],
  parentId: string,
  input: Omit<CreateCommentInput, 'parentId'>,
): Comment[] {
  const newReply = createComment({ ...input, parentId });

  const addToTree = (list: Comment[]): Comment[] => {
    return list.map((node) => {
      if (node.id === parentId) {
        return { ...node, replies: [...(node.replies ?? []), newReply] };
      }
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: addToTree(node.replies) };
      }
      return node;
    });
  };

  return addToTree(comments);
}

/**
 * 플랫 배열에서 댓글 삭제 (부모 삭제 시 자식도 함께 삭제)
 */
export function deleteFromFlat(comments: Comment[], targetId: string): Comment[] {
  return comments.filter((c) => c.id !== targetId && c.parentId !== targetId);
}

/**
 * 플랫 배열에서 댓글 수정
 */
export function updateInFlat(comments: Comment[], targetId: string, content: string): Comment[] {
  return comments.map((c) => (c.id === targetId ? { ...c, content: content.trim() } : c));
}

/**
 * 중첩 배열에서 댓글 삭제
 */
export function deleteFromTree(comments: Comment[], targetId: string): Comment[] {
  const removeFromTree = (list: Comment[]): Comment[] => {
    return list
      .filter((node) => node.id !== targetId)
      .map((node) => {
        if (node.replies && node.replies.length > 0) {
          return { ...node, replies: removeFromTree(node.replies) };
        }
        return node;
      });
  };

  return removeFromTree(comments);
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
    map.set(comment.id, { ...comment, replies: [] });
  }

  // 2. 부모-자식 관계 연결
  for (const comment of comments) {
    const node = map.get(comment.id)!;
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

/**
 * 트리 구조를 플랫 배열로 변환
 *
 * 부모 바로 다음에 자식들이 오도록 순서 보장합니다.
 */
export function treeToFlat(comments: Comment[]): Comment[] {
  const result: Comment[] = [];

  const flatten = (list: Comment[], parentId?: string) => {
    for (const comment of list) {
      const { replies, ...rest } = comment;
      result.push({ ...rest, parentId, isReply: Boolean(parentId) });
      if (replies && replies.length > 0) {
        flatten(replies, comment.id);
      }
    }
  };

  flatten(comments);
  return result;
}

/**
 * 플랫 배열에서 최상위 부모 댓글 ID 찾기
 *
 * 대댓글의 답글을 클릭하면 최상위 부모에게 답글이 달리도록 하기 위함
 *
 * @param comments - 플랫 구조 댓글 배열
 * @param commentId - 현재 댓글 ID
 * @returns 최상위 부모 댓글 ID (parentId가 없는 댓글)
 */
export function findRootParentId(comments: Comment[], commentId: string): string {
  const comment = comments.find((c) => c.id === commentId);

  // 댓글을 찾지 못하거나 이미 최상위 댓글이면 자기 자신 반환
  if (!comment || !comment.parentId) {
    return commentId;
  }

  // 재귀적으로 부모의 부모를 찾아감
  return findRootParentId(comments, comment.parentId);
}
