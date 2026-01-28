/**
 * @file video.ts
 * @description 비디오 피드백 관련 유틸리티 함수
 */
import { REACTION_TYPES } from '@/constants/reaction';
import type { ReactionType } from '@/types/script';
import type { ReactionEvent, SegmentHighlight } from '@/types/video';

/** 세그먼트 버킷 크기 (초) */
export const SEGMENT_BUCKET_SIZE = 5;

/**
 * 현재 재생 시간에 해당하는 슬라이드 인덱스를 계산
 *
 * @param currentTime - 현재 재생 시간 (초)
 * @param changeTimes - 슬라이드 전환 시간 배열 (오름차순)
 * @param maxIndex - 최대 인덱스 (슬라이드 개수 - 1), 결과 클램핑용
 * @returns 현재 시간에 해당하는 슬라이드 인덱스
 *
 * @example
 * // changeTimes = [0, 12, 24, 38] 일 때
 * getSlideIndexFromTime(15, changeTimes) // 1 (12초 슬라이드)
 * getSlideIndexFromTime(0, changeTimes)  // 0
 * getSlideIndexFromTime(50, changeTimes) // 3
 */
export function getSlideIndexFromTime(
  currentTime: number,
  changeTimes: number[],
  maxIndex?: number,
): number {
  let idx = 0;

  for (let i = 0; i < changeTimes.length; i += 1) {
    if (changeTimes[i] <= currentTime) {
      idx = i;
    } else {
      break;
    }
  }

  // maxIndex가 주어지면 클램핑
  if (maxIndex !== undefined) {
    return Math.max(0, Math.min(idx, maxIndex));
  }

  return idx;
}

/**
 * 숫자를 min, max 범위로 클램핑
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * 현재 시간 기준 ±window 범위 내의 피드백을 필터링
 *
 * @param feedbacks - 피드백 배열
 * @param currentTime - 현재 재생 시간 (초)
 * @param window - 탐색 범위 (기본값: 5초)
 * @returns 범위 내 피드백 배열
 */
export function getOverlappingFeedbacks<T extends { timestamp: number }>(
  feedbacks: T[],
  currentTime: number,
  window: number = 5,
): T[] {
  return feedbacks.filter((f) => Math.abs(f.timestamp - currentTime) <= window);
}

/**
 * 리액션 이벤트를 5초 버킷으로 나눠 세그먼트 하이라이트 생성
 *
 * @param reactionEvents - 리액션 이벤트 배열
 * @param duration - 영상 총 길이 (초)
 * @param topN - 상위 몇 개의 세그먼트를 반환할지 (기본값: 10)
 * @returns 세그먼트 하이라이트 배열 (리액션 총합 기준 상위 N개, 시간순 정렬)
 *
 * @description
 * 1) 영상을 절대적으로 5초 단위(0~5, 5~10…)로 나눔
 * 2) 각 버킷의 리액션 총합(totalCount) 계산
 * 3) 가장 많은 리액션을 대표 이모지로 선택 (동점 시 REACTION_TYPES 순서로 우선)
 * 4) 리액션 총합 기준 상위 10개만 반환
 * 5) 최종 결과는 시간순 정렬
 *
 * @example
 * const events = [{ type: 'fire', at: 2.5 }, { type: 'good', at: 7.0 }];
 * computeSegmentHighlights(events, 60);
 * // 리액션 총합 기준 상위 10개 세그먼트 반환 (시간순 정렬)
 */
export function computeSegmentHighlights(
  reactionEvents: ReactionEvent[],
  duration: number,
  topN: number = 10,
): SegmentHighlight[] {
  if (!reactionEvents.length || duration <= 0) return [];

  // 버킷 인덱스별 리액션 카운트 맵
  // bucketMap: { bucketIndex: { fire: 3, good: 2, ... } }
  const bucketMap = new Map<number, Record<ReactionType, number>>();

  reactionEvents.forEach((event) => {
    const bucketIndex = Math.floor(event.at / SEGMENT_BUCKET_SIZE);

    if (!bucketMap.has(bucketIndex)) {
      // 빈 카운트 객체 생성
      const counts = {} as Record<ReactionType, number>;
      REACTION_TYPES.forEach((type) => {
        counts[type] = 0;
      });
      bucketMap.set(bucketIndex, counts);
    }

    const counts = bucketMap.get(bucketIndex)!;
    counts[event.type] += 1;
  });

  // 각 버킷에서 대표 리액션 선택 + 총합 계산
  const allHighlights: SegmentHighlight[] = [];

  bucketMap.forEach((counts, bucketIndex) => {
    // 세그먼트 내 전체 리액션 총합
    const totalCount = REACTION_TYPES.reduce((sum, type) => sum + counts[type], 0);

    // 가장 많은 카운트 찾기
    let maxCount = 0;
    let topType: ReactionType | null = null;

    // REACTION_TYPES 순서대로 순회 → 동점 시 앞선 타입 우선
    REACTION_TYPES.forEach((type) => {
      const count = counts[type];
      if (count > maxCount) {
        maxCount = count;
        topType = type;
      }
    });

    // 리액션이 있는 버킷만 하이라이트에 추가
    if (topType && totalCount > 0) {
      const startTime = bucketIndex * SEGMENT_BUCKET_SIZE;
      const endTime = Math.min((bucketIndex + 1) * SEGMENT_BUCKET_SIZE, duration);

      allHighlights.push({
        startTime,
        endTime,
        topReactionType: topType,
        count: maxCount,
        totalCount,
      });
    }
  });

  // 리액션 총합 기준 내림차순 정렬 → 상위 N개 선택 → 시간순 재정렬
  return allHighlights
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, topN)
    .sort((a, b) => a.startTime - b.startTime);
}

/**
 * 사용자가 누른 리액션(active: true)만 프로그레스바에 이모지 마커로 표시
 *
 * @param feedbacks - VideoTimestampFeedback 배열 (timestamp + reactions)
 * @param duration - 영상 총 길이 (초)
 * @returns 세그먼트 하이라이트 배열 (시간순 정렬, topN 제한 없음)
 *
 * @description
 * 1) 각 feedback의 reactions 중 active === true인 것만 필터
 * 2) 5초 버킷으로 그룹화 (같은 버킷 내 active 타입 union)
 * 3) 대표 이모지는 REACTION_TYPES 순서 우선 (fire > sleepy > good > bad > confused)
 * 4) 사용자 리액션은 자연적으로 희소하므로 topN 제한 없음
 */
export function computeUserActiveHighlights(
  feedbacks: Array<{
    timestamp: number;
    reactions: Array<{ type: ReactionType; active?: boolean }>;
  }>,
  duration: number,
): SegmentHighlight[] {
  if (!feedbacks.length || duration <= 0) return [];

  // 버킷 인덱스별 active 리액션 타입 Set
  const bucketMap = new Map<number, Set<ReactionType>>();

  feedbacks.forEach((feedback) => {
    const activeTypes = feedback.reactions.filter((r) => r.active);
    if (!activeTypes.length) return;

    const bucketIndex = Math.floor(feedback.timestamp / SEGMENT_BUCKET_SIZE);

    if (!bucketMap.has(bucketIndex)) {
      bucketMap.set(bucketIndex, new Set());
    }

    const typeSet = bucketMap.get(bucketIndex)!;
    activeTypes.forEach((r) => typeSet.add(r.type));
  });

  // 각 버킷에서 REACTION_TYPES 순서 기준 대표 이모지 선택
  const highlights: SegmentHighlight[] = [];

  bucketMap.forEach((typeSet, bucketIndex) => {
    // REACTION_TYPES 순서대로 순회하여 첫 번째 매칭을 대표로 선택
    const topType = REACTION_TYPES.find((type) => typeSet.has(type));
    if (!topType) return;

    const startTime = bucketIndex * SEGMENT_BUCKET_SIZE;
    const endTime = Math.min((bucketIndex + 1) * SEGMENT_BUCKET_SIZE, duration);

    highlights.push({
      startTime,
      endTime,
      topReactionType: topType,
      count: 1,
      totalCount: typeSet.size,
    });
  });

  return highlights.sort((a, b) => a.startTime - b.startTime);
}

/**
 * feedbacks 배열을 기반으로 세그먼트 하이라이트 생성
 *
 * @param feedbacks - VideoTimestampFeedback 배열 (timestamp + reactions)
 * @param duration - 영상 총 길이 (초)
 * @param topN - 상위 몇 개의 세그먼트를 반환할지 (기본값: 10)
 * @returns 세그먼트 하이라이트 배열 (리액션 총합 기준 상위 N개, 시간순 정렬)
 *
 * @description
 * 1) 각 feedback의 timestamp를 5초 버킷으로 그룹화
 * 2) 각 버킷의 리액션 총합(totalCount) 계산
 * 3) 가장 많은 리액션을 대표 이모지로 선택 (동점 시 REACTION_TYPES 순서로 우선)
 * 4) 리액션 총합 기준 상위 10개만 반환
 * 5) 최종 결과는 시간순 정렬
 */
export function computeSegmentHighlightsFromFeedbacks(
  feedbacks: Array<{ timestamp: number; reactions: Array<{ type: ReactionType; count: number }> }>,
  duration: number,
  topN: number = 10,
): SegmentHighlight[] {
  if (!feedbacks.length || duration <= 0) return [];

  // 버킷 인덱스별 리액션 카운트 맵
  const bucketMap = new Map<number, Record<ReactionType, number>>();

  feedbacks.forEach((feedback) => {
    const bucketIndex = Math.floor(feedback.timestamp / SEGMENT_BUCKET_SIZE);

    if (!bucketMap.has(bucketIndex)) {
      const counts = {} as Record<ReactionType, number>;
      REACTION_TYPES.forEach((type) => {
        counts[type] = 0;
      });
      bucketMap.set(bucketIndex, counts);
    }

    const counts = bucketMap.get(bucketIndex)!;

    // feedback의 reactions 배열에서 count 누적
    feedback.reactions.forEach((reaction) => {
      counts[reaction.type] += reaction.count || 0;
    });
  });

  // 각 버킷에서 대표 리액션 선택 + 총합 계산
  const allHighlights: SegmentHighlight[] = [];

  bucketMap.forEach((counts, bucketIndex) => {
    const totalCount = REACTION_TYPES.reduce((sum, type) => sum + counts[type], 0);

    let maxCount = 0;
    let topType: ReactionType | null = null;

    REACTION_TYPES.forEach((type) => {
      const count = counts[type];
      if (count > maxCount) {
        maxCount = count;
        topType = type;
      }
    });

    if (topType && totalCount > 0) {
      const startTime = bucketIndex * SEGMENT_BUCKET_SIZE;
      const endTime = Math.min((bucketIndex + 1) * SEGMENT_BUCKET_SIZE, duration);

      allHighlights.push({
        startTime,
        endTime,
        topReactionType: topType,
        count: maxCount,
        totalCount,
      });
    }
  });

  return allHighlights
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, topN)
    .sort((a, b) => a.startTime - b.startTime);
}
