/**
 * @file analytics.ts
 * @description 인사이트 페이지 관련 API 엔드포인트
 */
import { apiClient } from '@/api/client';
import type {
  ReadPresentationAnalyticsSummaryDto,
  ReadRecentCommentListResponseDto,
  ReadSlideAnalyticsResponseDto,
  ReadSlideRetentionResponseDto,
  ReadVideoExitAnalyticsResponseDto,
  ReadVideoRetentionResponseDto,
  RecordAnalyticsEventResponseDto,
  RecordExitRequestDto,
  RecordExitResponseDto,
  RecordPageViewRequestDto,
  RecordSlideViewRequestDto,
  RecordSlideViewResponseDto,
  RecordVideoEventRequestDto,
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
export async function getPresentationAnalyticsSummary(
  projectId: number,
): Promise<ReadPresentationAnalyticsSummaryDto> {
  const response = await apiClient.get<ApiResponse<ReadPresentationAnalyticsSummaryDto>>(
    `/presentations/${projectId}/analytics/summary`,
  );
  // 데이터가 없으면 에러 발생 (null 반환 방지)
  if (!response.data.success) {
    throw new Error('프로젝트 분석 요약을 불러올 수 없습니다.');
  }
  return response.data.success;
}

/**
 * 이탈 기록
 */
export function recordExit(data: RecordExitRequestDto) {
  // keepalive 옵션이 필요 없으므로 apiClient로 통일
  return apiClient.post<ApiResponse<RecordExitResponseDto>>('/analytics/exit', data);
}

/**
 * 슬라이드 조회 기록
 */
export function slideView(data: RecordSlideViewRequestDto) {
  return apiClient.post<ApiResponse<RecordSlideViewResponseDto>>('/analytics/slide-view', data);
}
/**
 * 페이지 조회 기록
 */
export async function recordPageView(
  data: RecordPageViewRequestDto,
): Promise<RecordAnalyticsEventResponseDto> {
  const response = await apiClient.post<ApiResponse<RecordAnalyticsEventResponseDto>>(
    '/analytics/pageview',
    data,
  );
  if (!response.data.success) {
    throw new Error('페이지 조회 기록 전송에 실패했습니다.');
  }
  return response.data.success;
}

/**
 * 영상 이벤트 기록
 */
export async function recordVideoEvent(
  data: RecordVideoEventRequestDto,
): Promise<RecordAnalyticsEventResponseDto> {
  const response = await apiClient.post<ApiResponse<RecordAnalyticsEventResponseDto>>(
    '/analytics/video-event',
    data,
  );
  if (!response.data.success) {
    throw new Error('영상 이벤트 기록 전송에 실패했습니다.');
  }
  return response.data.success;
}

// 기존 코드와의 호환을 위한 별칭 타입
export type RecordExitRequest = RecordExitRequestDto;

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
