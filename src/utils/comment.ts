import type { CommentItem, CreateCommentInput } from '@/types/comment';

/**
 * 고유 ID 생성
 */
export function generateCommentId(): string {
  return crypto.randomUUID();
}

/**
 * 새 댓글 객체 생성
 */
export function createComment(input: CreateCommentInput): CommentItem {
  const isReply = Boolean(input.parentId);

  return {
    id: generateCommentId(),
    author: input.author ?? '익명',
    content: input.content.trim(),
    timestamp: new Date().toISOString(),
    isMine: true,
    slideRef: input.slideRef,
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
  comments: CommentItem[],
  parentId: string,
  input: Omit<CreateCommentInput, 'parentId'>,
): CommentItem[] {
  const newReply = createComment({ ...input, parentId });

  const parentIndex = comments.findIndex((c) => c.id === parentId);
  if (parentIndex === -1) return comments;

  const result = [...comments];
  result.splice(parentIndex + 1, 0, newReply);
  return result;
}

/**
 * 중첩 배열에 답글 추가 (부모의 replies 배열에 추가)
 *
 * FeedbackSlidePage(Comment) 방식: 중첩 배열 구조
 */
export function addReplyToTree(
  comments: CommentItem[],
  parentId: string,
  input: Omit<CreateCommentInput, 'parentId'>,
): CommentItem[] {
  const newReply = createComment({ ...input, parentId });

  const addToTree = (list: CommentItem[]): CommentItem[] => {
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
export function deleteFromFlat(comments: CommentItem[], targetId: string): CommentItem[] {
  return comments.filter((c) => c.id !== targetId && c.parentId !== targetId);
}

/**
 * 중첩 배열에서 댓글 삭제
 */
export function deleteFromTree(comments: CommentItem[], targetId: string): CommentItem[] {
  const removeFromTree = (list: CommentItem[]): CommentItem[] => {
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
export function flatToTree(comments: CommentItem[]): CommentItem[] {
  const map = new Map<string, CommentItem>();
  const roots: CommentItem[] = [];

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
export function treeToFlat(comments: CommentItem[]): CommentItem[] {
  const result: CommentItem[] = [];

  const flatten = (list: CommentItem[], parentId?: string) => {
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
