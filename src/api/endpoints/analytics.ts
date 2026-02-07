/**
 * @file analytics.ts
 * @description 인사이트 페이지 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type {
  ProjectAnalyticsSummaryDto,
  SlideAnalyticsResponseDto,
  SlideRetentionResponseDto,
  VideoExitAnalyticsResponseDto,
  VideoRetentionResponseDto,
} from '@/api/dto/analytics.dto';
import type { ApiResponse } from '@/types/api';

// 슬라이드 분석 api 연동
export async function getSlideAnalytics(projectId: number): Promise<SlideAnalyticsResponseDto> {
  const response = await apiClient.get<ApiResponse<SlideAnalyticsResponseDto>>(
    `/presentations/${projectId}/analytics/slides`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('슬라이드 분석 데이터를 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 영상 분석 api 연동
export async function getVideoAnalytics(videoId: number): Promise<VideoExitAnalyticsResponseDto> {
  const response = await apiClient.get<ApiResponse<VideoExitAnalyticsResponseDto>>(
    `/videos/${videoId}/analytics/exits`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('영상 분석 데이터를 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 프로젝트 분석 요약 api 연동(상단 카드 4개 + videoId)
export async function getProjectAnalyticsSummary(
  projectId: number,
): Promise<ProjectAnalyticsSummaryDto> {
  const response = await apiClient.get<ApiResponse<ProjectAnalyticsSummaryDto>>(
    `/presentations/${projectId}/analytics/summary`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('프로젝트 분석 요약을 불러올 수 없습니다.');
  }
  return response.data.success;
}

export interface RecordExitRequest {
  projectId: number;
  lastSlideId?: number;
  lastVideoId?: number;
  lastVideoTimeMs?: number;
}

export function recordExit(data: RecordExitRequest) {
  // try-catch 블록을 제거하세요!

  const baseURL = apiClient.defaults.baseURL ?? '';
  // baseURL 처리 (기존 로직 유지)
  const fullUrl = baseURL ? new URL('/analytics/exit', baseURL).toString() : '/analytics/exit';

  // return fetch(...)를 바로 반환하여 Promise가 끊기지 않게 합니다.
  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    keepalive: true,
  });
}

// 슬라이드별 청중 잔존률 api 연동
export async function getSlideRetention(projectId: number): Promise<SlideRetentionResponseDto> {
  const response = await apiClient.get<ApiResponse<SlideRetentionResponseDto>>(
    `/presentations/${projectId}/analytics/slide-retention`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('슬라이드 청중 잔존률을 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 영상별 시청 잔존률 api 연동
export async function getVideoRetention(videoId: number): Promise<VideoRetentionResponseDto> {
  const response = await apiClient.get<ApiResponse<VideoRetentionResponseDto>>(
    `/videos/${videoId}/analytics/retention`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('영상 시청 잔존률을 불러올 수 없습니다.');
  }
  return response.data.success;
}
