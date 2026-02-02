/**
 * @file analytics.ts
 * @description 인사이트 페이지 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type { ApiResponse } from '@/types/api';

export interface RecordExitRequest {
  projectId: number;
  lastSlideId?: number;
  lastVideoId?: number;
  lastVideoTimeMs?: number;
}

export async function recordExit(data: RecordExitRequest) {
  const { data: response } = await apiClient.post('/analytics/exit', data);
  return response;
}

export interface SlideAnalytics {
  slideId: string;
  slideNum: number;
  title: string;
  viewCount: number;
  exitCount: number;
  exitRate: number;
  reactionCount: number;
  commentCount: number;
  feedbackCount: number;
}

export interface SlideAnalyticsResponse {
  slides: SlideAnalytics[];
}

export async function getSlideAnalytics(projectId: string): Promise<SlideAnalyticsResponse> {
  const response = await apiClient.get<ApiResponse<SlideAnalyticsResponse>>(
    `/presentations/${projectId}/analytics/slides`,
  );
  return response.data.success;
}

export interface VideoExitAnalytics {
  timestampMs: number;
  exitCount: number;
  exitRate: number;
}

export interface VideoExitAnalyticsResponse {
  exits: VideoExitAnalytics[];
}

export async function getVideoExitAnalytics(videoId: string): Promise<VideoExitAnalyticsResponse> {
  const response = await apiClient.get<ApiResponse<VideoExitAnalyticsResponse>>(
    `/videos/${videoId}/analytics/exits`,
  );
  return response.data.success;
}

export interface ProjectVideoItem {
  id: string;
  title: string;
  status: string;
  durationSeconds: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface ProjectVideosResponse {
  videos: ProjectVideoItem[];
}

export async function getProjectVideos(projectId: string): Promise<ProjectVideosResponse> {
  const response = await apiClient.get<ApiResponse<ProjectVideosResponse>>(
    `/presentations/${projectId}/videos`,
  );
  return response.data.success;
}
