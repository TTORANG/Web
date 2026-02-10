/**
 * @file analytics.ts
 * @description 인사이트 페이지 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type {
  ReadProjectAnalyticsSummaryDto,
  ReadRecentCommentListResponseDto,
  ReadSlideAnalyticsResponseDto,
  ReadSlideRetentionResponseDto,
  ReadVideoExitAnalyticsResponseDto,
  ReadVideoRetentionResponseDto,
  RecordExitRequestDto,
  RecordExitResponseDto,
  RecordPageViewRequestDto,
  RecordPageViewResponseDto,
  RecordSlideViewRequestDto,
  RecordSlideViewResponseDto,
} from '@/api/dto/analytics.dto';
import type { ApiResponse } from '@/types/api';

// 슬라이드 분석 api 연동
export async function getSlideAnalytics(projectId: number): Promise<ReadSlideAnalyticsResponseDto> {
  const response = await apiClient.get<ApiResponse<ReadSlideAnalyticsResponseDto>>(
    `/presentations/${projectId}/analytics/slides`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('슬라이드 분석 데이터를 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 영상 분석 api 연동
export async function getVideoAnalytics(
  videoId: number,
): Promise<ReadVideoExitAnalyticsResponseDto> {
  const response = await apiClient.get<ApiResponse<ReadVideoExitAnalyticsResponseDto>>(
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
): Promise<ReadProjectAnalyticsSummaryDto> {
  const response = await apiClient.get<ApiResponse<ReadProjectAnalyticsSummaryDto>>(
    `/presentations/${projectId}/analytics/summary`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('프로젝트 분석 요약을 불러올 수 없습니다.');
  }
  return response.data.success;
}

export function recordExit(data: RecordExitRequestDto) {
  // keepalive 옵션이 필요 없으므로 apiClient로 통일
  return apiClient.post<ApiResponse<RecordExitResponseDto>>('/analytics/exit', data);
}

export function pageView(data: RecordPageViewRequestDto) {
  return apiClient.post<ApiResponse<RecordPageViewResponseDto>>('/analytics/pageview', data);
}

export function slideView(data: RecordSlideViewRequestDto) {
  return apiClient.post<ApiResponse<RecordSlideViewResponseDto>>('/analytics/slide-view', data);
}

// 슬라이드별 청중 잔존률 api 연동
export async function getSlideRetention(projectId: number): Promise<ReadSlideRetentionResponseDto> {
  const response = await apiClient.get<ApiResponse<ReadSlideRetentionResponseDto>>(
    `/presentations/${projectId}/analytics/slide-retention`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('슬라이드 청중 잔존률을 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 영상별 시청 잔존률 api 연동
export async function getVideoRetention(videoId: number): Promise<ReadVideoRetentionResponseDto> {
  const response = await apiClient.get<ApiResponse<ReadVideoRetentionResponseDto>>(
    `/videos/${videoId}/analytics/retention`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('영상 시청 잔존률을 불러올 수 없습니다.');
  }
  return response.data.success;
}

// 최근 댓글 피드백 api 연동
export async function getRecentComments(
  projectId: number,
): Promise<ReadRecentCommentListResponseDto> {
  const response = await apiClient.get<ApiResponse<ReadRecentCommentListResponseDto>>(
    `/presentations/${projectId}/analytics/recent-comments`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('최근 댓글 피드백을 불러올 수 없습니다.');
  }
  return response.data.success;
}
