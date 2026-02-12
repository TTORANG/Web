import type { Comment } from '@/types/comment';

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
  const deleteIds = new Set<string>([targetId]);
  let hasNewChild = true;

  // target의 모든 하위 답글(자손)까지 재귀적으로 수집
  while (hasNewChild) {
    hasNewChild = false;
    for (const comment of comments) {
      if (!comment.parentId) continue;
      if (deleteIds.has(comment.parentId) && !deleteIds.has(comment.commentId)) {
        deleteIds.add(comment.commentId);
        hasNewChild = true;
      }
    }
  }

  return comments.filter((c) => !deleteIds.has(c.commentId));
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

/**
 * 트리 구조 댓글의 전체 개수(댓글+답글)를 계산
 */
export function countTreeComments(comments: Comment[]): number {
  return comments.reduce(
    (count, comment) => count + 1 + countTreeComments(comment.replies ?? []),
    0,
  );
}
