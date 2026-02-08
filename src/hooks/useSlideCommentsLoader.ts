/**
 * 슬라이드 댓글 로딩 공통 훅
 *
 * - slideId 변경 시 댓글 초기화
 * - getSlideComments 호출 결과를 store에 주입
 */
import { useEffect, useRef } from 'react';

import type { Comment } from '@/types/comment';

import { useSlideCommentsQuery } from './queries/useSlideCommentsQuery';
import { useSlideActions } from './useSlideSelectors';

type UseSlideCommentsLoaderOptions = {
  mapComments?: (comments: Comment[]) => Comment[];
};

export function useSlideCommentsLoader(slideId?: string, options?: UseSlideCommentsLoaderOptions) {
  const { setComments } = useSlideActions();
  const { data: fetchedComments, isLoading, dataUpdatedAt } = useSlideCommentsQuery(slideId);
  const lastAppliedRef = useRef(0);

  useEffect(() => {
    setComments([]);
  }, [slideId, setComments]);

  useEffect(() => {
    if (!fetchedComments) return;
    if (dataUpdatedAt && lastAppliedRef.current === dataUpdatedAt) return;
    if (dataUpdatedAt) lastAppliedRef.current = dataUpdatedAt;
    const mapped = options?.mapComments ? options.mapComments(fetchedComments) : fetchedComments;
    setComments(mapped);
  }, [dataUpdatedAt, fetchedComments, options?.mapComments, setComments]);

  return { isLoading };
}
