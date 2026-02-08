/**
 * 슬라이드 댓글 로딩 공통 훅
 *
 * - slideId 변경 시 댓글 초기화
 * - getSlideComments 호출 결과를 store에 주입
 */
import { useEffect } from 'react';

import type { Comment } from '@/types/comment';

import { useSlideCommentsQuery } from './queries/useSlideCommentsQuery';
import { useSlideActions } from './useSlideSelectors';

type UseSlideCommentsLoaderOptions = {
  mapComments?: (comments: Comment[]) => Comment[];
};

export function useSlideCommentsLoader(slideId?: string, options?: UseSlideCommentsLoaderOptions) {
  const { setComments } = useSlideActions();
  const { data: fetchedComments, isLoading } = useSlideCommentsQuery(slideId);

  useEffect(() => {
    setComments([]);
  }, [slideId, setComments]);

  useEffect(() => {
    if (!fetchedComments) return;
    const mapped = options?.mapComments ? options.mapComments(fetchedComments) : fetchedComments;
    setComments(mapped);
  }, [fetchedComments, options, options?.mapComments, setComments]);

  return { isLoading };
}
