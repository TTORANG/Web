/**
 * @file videoReactions.ts
 * @description Video reaction related APIs.
 */
import { apiClient } from '@/api/client';
import type {
  CreateVideoReactionDto,
  CreateVideoReactionResponseDto,
  ReadVideoReactionBucketsResponseDto,
  ReadVideoReactionSummaryItemDto,
  ReadVideoReactionTimelineResponseDto,
} from '@/api/dto/reactions.dto';
import type { ApiResponse } from '@/types/api';

export type { CreateVideoReactionDto as CreateVideoReactionRequest };

/**
 * 영상 타임스탬프 리액션 생성
 * 요청 1회 = 카운트 1 증가 (토글 아님)
 */
export async function createVideoReaction(
  videoId: string,
  data: CreateVideoReactionDto,
): Promise<CreateVideoReactionResponseDto> {
  const { data: response } = await apiClient.post<ApiResponse<CreateVideoReactionResponseDto>>(
    `/videos/${videoId}/reactions`,
    data,
  );

  if (response.resultType === 'SUCCESS') {
    return response.success;
  }

  throw new Error(response.error.reason);
}

/**
 * 시간대별 영상 리액션 조회Read reaction counts around a timestamp window.
 현재 재생시간(timestmapMs) 기준 +-windowMs범위 내 리액션을 조회
*/
export async function getVideoReactions(
  videoId: string,
  params: { timestampMs: number; windowMs?: number },
): Promise<ReadVideoReactionSummaryItemDto[]> {
  const { data } = await apiClient.get<ApiResponse<ReadVideoReactionSummaryItemDto[]>>(
    `/videos/${videoId}/reactions`,
    { params },
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }

  throw new Error(data.error.reason);
}

/**
 * 타임라인 리액션조회, 구간별 대표이모지찾기_재생바표기할때 씀.
 * 버킷설정해서 최상위 10개 뽑아서 재생바에 표기하기
 */
export async function getVideoReactionTimeline(
  videoId: string,
  params?: { intervalMs?: number },
): Promise<ReadVideoReactionTimelineResponseDto> {
  const { data } = await apiClient.get<ApiResponse<ReadVideoReactionTimelineResponseDto>>(
    `/videos/${videoId}/reactions/timeline`,
    { params },
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }

  throw new Error(data.error.reason);
}

/**
 * 타임라인 버킷별 전체 리액션 조회
 * intervalMs 단위 버킷으로 묶어 각 구간의 이모지별 개수와 totalCount를 반환
 */
export async function getVideoReactionBuckets(
  videoId: string,
  params?: { intervalMs?: number },
): Promise<ReadVideoReactionBucketsResponseDto> {
  const { data } = await apiClient.get<ApiResponse<ReadVideoReactionBucketsResponseDto>>(
    `/videos/${videoId}/reactions/timeline/buckets`,
    { params },
  );

  if (data.resultType === 'SUCCESS') {
    return data.success;
  }

  throw new Error(data.error.reason);
}
