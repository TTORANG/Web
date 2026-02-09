/**
 * 슬라이드 댓글 로딩 공통 훅
 *
 * - slideId 변경 시 서버에서 댓글 로드
 * - 초기 로드 후에는 Zustand store가 댓글 상태를 관리
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
  const { data: fetchedComments, isLoading } = useSlideCommentsQuery(slideId);
  const prevSlideIdRef = useRef<string | undefined>(undefined);
  const initialLoadDoneRef = useRef(false);

  // slideId가 변경되면 초기 로드 플래그 리셋
  useEffect(() => {
    if (prevSlideIdRef.current !== slideId) {
      prevSlideIdRef.current = slideId;
      initialLoadDoneRef.current = false;
      setComments([]);
    }
  }, [slideId, setComments]);

  // 초기 로드 시에만 서버 데이터를 store에 적용
  useEffect(() => {
    if (!fetchedComments || initialLoadDoneRef.current) return;

    initialLoadDoneRef.current = true;
    const mapped = options?.mapComments ? options.mapComments(fetchedComments) : fetchedComments;
    setComments(mapped);
  }, [fetchedComments, options?.mapComments, setComments]);

  return { isLoading };
}
