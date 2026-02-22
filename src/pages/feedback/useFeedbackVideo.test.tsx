import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordVideoEvent } from '@/api/endpoints/analytics';
import { videosApi } from '@/api/endpoints/videos';
import { useSharedComments } from '@/hooks/queries/useSharedComments';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useVideoReactions } from '@/hooks/useVideoReactions';
import { useVideoFeedbackStore } from '@/stores/videoFeedbackStore';
import type { ReadSharedContentData } from '@/types/share';

import { useFeedbackVideo } from './useFeedbackVideo';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: vi.fn(),
  };
});

vi.mock('@/api/endpoints/analytics', () => ({
  recordVideoEvent: vi.fn(),
}));

vi.mock('@/api/endpoints/videos', () => ({
  videosApi: {
    getVideoDetail: vi.fn(),
    getVideoSlides: vi.fn(),
  },
}));

vi.mock('@/hooks/queries/useSharedComments', () => ({
  useSharedComments: vi.fn(),
}));

vi.mock('@/hooks/useVideoComments', () => ({
  useVideoComments: vi.fn(),
}));

vi.mock('@/hooks/useVideoReactions', () => ({
  useVideoReactions: vi.fn(),
}));

const mockedUseParams = vi.mocked(useParams);
const mockedUseQueryClient = vi.mocked(useQueryClient);
const mockedRecordVideoEvent = vi.mocked(recordVideoEvent);
const mockedVideosApi = vi.mocked(videosApi);
const mockedUseSharedComments = vi.mocked(useSharedComments);
const mockedUseVideoComments = vi.mocked(useVideoComments);
const mockedUseVideoReactions = vi.mocked(useVideoReactions);

const baseSharedContent: ReadSharedContentData = {
  message: 'ok',
  sessionInfo: {
    sessionId: 'session-1',
    name: 'anonymous',
    tokens: {
      accessToken: 'a',
      refreshToken: 'b',
    },
  },
  shareInfo: {
    shareToken: 'share-token',
    scope: 'slides_script_video',
    createdAt: '2025-01-01T00:00:00.000Z',
    publisherName: 'tester',
  },
  presentationContent: {
    title: '공유 영상',
    slides: [
      {
        slideId: '1',
        slideNum: 1,
        title: '슬라이드 1',
        imageUrl: 'https://example.com/s1.png',
        scriptText: 'script 1',
        timestampMs: 0,
      },
      {
        slideId: '2',
        slideNum: 2,
        title: '슬라이드 2',
        imageUrl: 'https://example.com/s2.png',
        scriptText: 'script 2',
        timestampMs: 5000,
      },
    ],
    video: {
      videoId: '101',
      videoUrl: 'https://cdn.ttorang.com/video.m3u8',
      thumbnailUrl: null,
    },
    comments: [],
  },
};

describe('useFeedbackVideo', () => {
  const invalidateQueriesMock = vi.fn().mockResolvedValue(undefined);
  const getQueryDataMock = vi.fn();
  const addCommentMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useVideoFeedbackStore.setState({ video: null, currentTime: 0, seekTo: null });

    mockedUseParams.mockReturnValue({ shareToken: 'share-token' });
    mockedUseQueryClient.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
      getQueryData: getQueryDataMock,
    } as never);

    mockedUseVideoComments.mockReturnValue({
      comments: [],
      addComment: addCommentMock,
      addReply: vi.fn(),
      deleteComment: vi.fn(),
      updateComment: vi.fn(),
    });

    mockedUseVideoReactions.mockReturnValue({
      reactions: [],
      addReaction: vi.fn(),
    });

    mockedUseSharedComments.mockReturnValue({
      data: { comments: [] },
    } as never);

    mockedVideosApi.getVideoDetail.mockResolvedValue({
      data: {
        resultType: 'SUCCESS',
        success: {
          video: {
            title: '서버 영상',
            durationSeconds: 120,
            hlsMasterUrl: 'https://cdn.ttorang.com/server.m3u8',
          },
        },
      },
    } as never);
    mockedVideosApi.getVideoSlides.mockResolvedValue({
      data: {
        resultType: 'SUCCESS',
        success: {
          slides: [
            { slideId: '1', timestampMs: 0 },
            { slideId: '2', timestampMs: 4000 },
          ],
        },
      },
    } as never);
  });

  it('공유 슬라이드 타임라인이 있으면 video slides API를 추가 호출하지 않는다', async () => {
    const { result } = renderHook(() => useFeedbackVideo(baseSharedContent));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedVideosApi.getVideoSlides).not.toHaveBeenCalled();
    expect(mockedVideosApi.getVideoDetail).not.toHaveBeenCalled();
  });

  it('타임라인/영상 URL이 없으면 필요한 API를 1회씩 호출한다', async () => {
    const contentWithoutTimeline: ReadSharedContentData = {
      ...baseSharedContent,
      presentationContent: {
        ...baseSharedContent.presentationContent,
        slides: baseSharedContent.presentationContent.slides.map((slide) => ({
          ...slide,
          timestampMs: -1,
        })),
        video: {
          videoId: '101',
          videoUrl: null,
          thumbnailUrl: null,
        },
      },
    };

    const { result } = renderHook(() => useFeedbackVideo(contentWithoutTimeline));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedVideosApi.getVideoDetail).toHaveBeenCalledTimes(1);
    expect(mockedVideosApi.getVideoSlides).toHaveBeenCalledTimes(1);
  });

  it('공유 제목이 비어 있으면 상세 API를 호출해 제목을 보정한다', async () => {
    const contentWithoutTitle: ReadSharedContentData = {
      ...baseSharedContent,
      presentationContent: {
        ...baseSharedContent.presentationContent,
        title: '',
      },
    };

    const { result } = renderHook(() => useFeedbackVideo(contentWithoutTitle));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedVideosApi.getVideoDetail).toHaveBeenCalledTimes(1);
    expect(mockedVideosApi.getVideoSlides).not.toHaveBeenCalled();
  });

  it('댓글 등록 시 공유 댓글 invalidate를 1회 호출한다', async () => {
    addCommentMock.mockResolvedValue('comment-1');
    getQueryDataMock.mockReturnValue({
      comments: [{ commentId: 'comment-1' }],
    });

    const { result } = renderHook(() => useFeedbackVideo(baseSharedContent));

    await act(async () => {
      result.current.setCommentDraft('테스트 댓글');
    });

    await act(async () => {
      await result.current.handleAddComment();
    });

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(1);
    expect(mockedRecordVideoEvent).not.toHaveBeenCalled();
  });
});
