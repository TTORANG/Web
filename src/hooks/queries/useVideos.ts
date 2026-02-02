/**
 * @file useVideos.ts
 * @description 영상 관련 TanStack Query 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateVideoCommentDto, CreateVideoDto, FinishRecordingDto } from '@/api/dto';
import {
  createVideo,
  createVideoComment,
  finishRecording,
  getVideoDetail,
  getVideoSlideTimeline,
  uploadVideo,
} from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';

/**
 * 영상 상세 조회
 *
 * @param videoId - 영상 ID
 */
export function useVideoDetail(videoId: string) {
  return useQuery({
    queryKey: queryKeys.videos.detail(videoId),
    queryFn: () => getVideoDetail(videoId),
    enabled: !!videoId,
  });
}

/**
 * 영상 슬라이드 타임라인 조회
 *
 * @param videoId - 영상 ID
 */
export function useVideoSlideTimeline(videoId: string) {
  return useQuery({
    queryKey: [...queryKeys.videos.detail(videoId), 'timeline'],
    queryFn: () => getVideoSlideTimeline(videoId),
    enabled: !!videoId,
  });
}

/**
 * 영상 생성
 */
export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVideoDto) => createVideo(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.lists() });
    },
  });
}

/**
 * 영상 파일 업로드
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, file }: { videoId: string; file: File }) => uploadVideo(videoId, file),
    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}

/**
 * 녹화 종료 및 영상 처리
 */
export function useFinishRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: FinishRecordingDto }) =>
      finishRecording(videoId, data),
    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}

/**
 * 영상 댓글 생성
 */
export function useCreateVideoComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: CreateVideoCommentDto }) =>
      createVideoComment(videoId, data),
    onSuccess: (_, { videoId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}
