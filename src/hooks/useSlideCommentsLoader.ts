/**
 * 슬라이드 댓글 로딩 공통 훅
 *
 * - slideId 변경 시 서버에서 댓글 로드 (무한 스크롤)
 * - 모든 페이지를 flatten하여 Zustand store에 동기화
 * - 낙관적 댓글(서버 미확인)은 보존
 */
import { useEffect, useRef } from 'react';

import type { FetchNextPageOptions, InfiniteQueryObserverResult } from '@tanstack/react-query';

import { useSlideStore } from '@/stores/slideStore';
import type { Comment } from '@/types/comment';

import { useSlideCommentsInfiniteQuery } from './queries/useSlideCommentsQuery';
import { useSlideActions } from './useSlideSelectors';

type UseSlideCommentsLoaderOptions = {
  mapComments?: (comments: Comment[]) => Comment[];
  enabled?: boolean;
  resetOnSlideChange?: boolean;
};

export type CommentsPaginationState = {
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult>;
};

export function useSlideCommentsLoader(
  slideId?: string,
  options?: UseSlideCommentsLoaderOptions,
): CommentsPaginationState {
  const isEnabled = options?.enabled ?? true;
  const resetOnSlideChange = options?.resetOnSlideChange ?? true;
  const { setComments } = useSlideActions();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSlideCommentsInfiniteQuery(slideId);
  const prevSlideIdRef = useRef<string | undefined>(undefined);

  // slideId가 변경되면 댓글 초기화
  useEffect(() => {
    if (!isEnabled || !resetOnSlideChange) return;
    if (prevSlideIdRef.current !== slideId) {
      prevSlideIdRef.current = slideId;
      setComments([]);
    }
  }, [slideId, setComments, isEnabled, resetOnSlideChange]);

  // 서버 데이터가 변경될 때마다 store에 동기화
  // 낙관적 댓글(serverId 없는 top-level)과 답글(isReply/parentId)은 보존
  useEffect(() => {
    if (!isEnabled) return;
    if (!data) return;

    const serverComments = data.pages.flatMap((p) => p.comments);
    const mappedServerComments = options?.mapComments
      ? options.mapComments(serverComments)
      : serverComments;
    const localComments = useSlideStore.getState().slide?.comments ?? [];
    const optimisticComments = localComments.filter((comment) => !comment.serverId);
    const mergedComments = [...optimisticComments, ...mappedServerComments];
    const isSameLength = localComments.length === mergedComments.length;
    const isSameOrderAndIdentity =
      isSameLength && localComments.every((comment, index) => comment === mergedComments[index]);

    if (isSameOrderAndIdentity) return;

    setComments(mergedComments);
  }, [data, options?.mapComments, setComments, isEnabled]);

  return {
    isLoading: isEnabled ? isLoading : false,
    hasNextPage: isEnabled ? hasNextPage : false,
    isFetchingNextPage: isEnabled ? isFetchingNextPage : false,
    fetchNextPage: isEnabled ? fetchNextPage : async () => ({}) as InfiniteQueryObserverResult,
  };
}
