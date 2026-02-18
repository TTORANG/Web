import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryClient';
import { useSlideStore } from '@/stores/slideStore';
import { createMockComment, createMockSlide } from '@/test/fixtures';
import { showToast } from '@/utils/toast';

import { useSlideCommentsActions } from './useSlideCommentsActions';

const mockCreateSlideComment = vi.fn();
const mockCreateReply = vi.fn();
const mockDeleteComment = vi.fn();
const mockUpdateComment = vi.fn();

vi.mock('@/api/endpoints/comments', () => ({
  createSlideComment: (...args: unknown[]) => mockCreateSlideComment(...args),
  createReply: (...args: unknown[]) => mockCreateReply(...args),
  deleteComment: (...args: unknown[]) => mockDeleteComment(...args),
  updateComment: (...args: unknown[]) => mockUpdateComment(...args),
}));

vi.mock('@/utils/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/project-1']}>
          <Routes>
            <Route path="/:projectId" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useSlideCommentsActions - deleteComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSlideStore.setState({ slide: null });
  });

  it('optimistically removes root comment from store and list cache', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);

    mockDeleteComment.mockResolvedValue({
      deletedTargetType: 'comment',
      commentId: 'c1',
    });

    useSlideStore.getState().initSlide(
      createMockSlide({
        slideId: 'slide-1',
        comments: [
          createMockComment({ commentId: 'c1', serverId: 'c1' }),
          createMockComment({ commentId: 'c2', serverId: 'c2' }),
        ],
      }),
    );

    queryClient.setQueryData(queryKeys.comments.list('slide-1'), {
      pages: [
        {
          comments: [{ commentId: 'c1' }, { commentId: 'c2' }],
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        },
      ],
      pageParams: [1],
    });

    const { result } = renderHook(() => useSlideCommentsActions(), { wrapper });

    await act(async () => {
      await result.current.deleteComment('c1');
    });

    expect(mockDeleteComment).toHaveBeenCalledWith({ commentId: 'c1' });
    expect(showToast.success).toHaveBeenCalledWith('댓글을 삭제했습니다.');
    expect(useSlideStore.getState().slide?.comments?.map((c) => c.commentId)).toEqual(['c2']);

    const listCache = queryClient.getQueryData<{
      pages: Array<{ comments: Array<{ commentId: string }> }>;
    }>(queryKeys.comments.list('slide-1'));
    expect(listCache?.pages[0]?.comments).toEqual([{ commentId: 'c2' }]);
  });

  it('deletes reply not present in store via server id and reply cache', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);

    mockDeleteComment.mockResolvedValue({
      deletedTargetType: 'reply',
      replyId: 'r1',
      parentCommentId: 'p1',
    });

    useSlideStore.getState().initSlide(
      createMockSlide({
        slideId: 'slide-1',
        comments: [createMockComment({ commentId: 'p1', serverId: 'p1' })],
      }),
    );

    queryClient.setQueryData(queryKeys.comments.replies('p1'), [
      { commentId: 'r1', parentCommentId: 'p1' },
    ]);

    const { result } = renderHook(() => useSlideCommentsActions(), { wrapper });

    await act(async () => {
      await result.current.deleteComment('r1');
    });

    expect(mockDeleteComment).toHaveBeenCalledWith({ commentId: 'r1' });
    expect(queryClient.getQueryData(queryKeys.comments.replies('p1'))).toEqual([]);
  });

  it('rolls back store and caches on delete failure', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);

    mockDeleteComment.mockRejectedValue(new Error('delete failed'));

    useSlideStore.getState().initSlide(
      createMockSlide({
        slideId: 'slide-1',
        comments: [
          createMockComment({ commentId: 'c1', serverId: 'c1' }),
          createMockComment({ commentId: 'c2', serverId: 'c2' }),
        ],
      }),
    );

    queryClient.setQueryData(queryKeys.comments.list('slide-1'), {
      pages: [
        {
          comments: [{ commentId: 'c1' }, { commentId: 'c2' }],
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        },
      ],
      pageParams: [1],
    });

    const { result } = renderHook(() => useSlideCommentsActions(), { wrapper });

    await act(async () => {
      await result.current.deleteComment('c1');
    });

    expect(showToast.error).toHaveBeenCalledWith(
      '댓글을 삭제하지 못했습니다.',
      '잠시 후 다시 시도해주세요.',
    );
    expect(useSlideStore.getState().slide?.comments?.map((c) => c.commentId)).toEqual(['c1', 'c2']);

    const listCache = queryClient.getQueryData<{
      pages: Array<{ comments: Array<{ commentId: string }> }>;
    }>(queryKeys.comments.list('slide-1'));
    expect(listCache?.pages[0]?.comments).toEqual([{ commentId: 'c1' }, { commentId: 'c2' }]);
  });
});
