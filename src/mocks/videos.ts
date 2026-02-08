/**
 * 웹캠 녹화 영상 피드백용 목데이터
 * - 영상별 댓글, 리액션 관리
 * - MOCK_USERS 기반으로 작성자 지정
 * - feedbacks의 reactions를 기반으로 재생바 하이라이트 생성
 */
import type { VideoFeedback } from '@/types/video';

import { MOCK_USERS } from './users';
import { timeAgo } from './utils';

/**
 * 테스트용 웹캠 영상
 * - duration: 596초 (9:56)
 * - 영상 전체에 걸쳐 다양한 시간대에 feedbacks 분포
 * - 상위 10개 세그먼트가 재생바에 하이라이트로 표시됨
 */
export const MOCK_VIDEO: VideoFeedback = {
  videoId: 1,
  videoUrl: '/p1.webm',
  title: '테스트 영상',
  duration: 596,
  comments: [],
  reactionEvents: [],
  feedbacks: [
    // ===== 앞부분 (0~60초) =====
    // 3초 - fire 우세 (총합: 15)
    {
      timestampMs: 3_000,
      comments: [
        {
          commentId: 'vc-1',
          userId: MOCK_USERS[0].id,
          content: '오프닝이 멋있네요!',
          createdAt: timeAgo(2, 'minute'),
          isMine: true,
          ref: { kind: 'video' as const, seconds: 3 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 8, active: true },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 5, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 15초 - good 우세 (총합: 12)
    {
      timestampMs: 15_000,
      comments: [
        {
          commentId: 'vc-3',
          userId: MOCK_USERS[2].id,
          content: '배경 음악이 좋습니다.',
          createdAt: timeAgo(5, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 15 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 2, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 7, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 28초 - sleepy 우세 (총합: 8)
    {
      timestampMs: 28_000,
      comments: [],
      reactions: [
        { type: 'fire' as const, count: 1, active: false },
        { type: 'sleepy' as const, count: 5, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 45초 - fire 우세 (총합: 20) - 인기 구간!
    {
      timestampMs: 45_000,
      comments: [
        {
          commentId: 'vc-45-1',
          userId: MOCK_USERS[1].id,
          content: '여기 정말 좋아요!',
          createdAt: timeAgo(10, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 45 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 12, active: true },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 6, active: true },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // ===== 중간부분 (60~300초) =====
    // 90초 - confused 우세 (총합: 10)
    {
      timestampMs: 90_000,
      comments: [
        {
          commentId: 'vc-90-1',
          userId: MOCK_USERS[3].id,
          content: '이 부분이 좀 어려웠어요.',
          createdAt: timeAgo(8, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 90 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 1, active: false },
        { type: 'sleepy' as const, count: 2, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 6, active: false },
      ],
    },

    // 150초 - fire 우세 (총합: 25) - 가장 인기 구간!
    {
      timestampMs: 150_000,
      comments: [
        {
          commentId: 'vc-150-1',
          userId: MOCK_USERS[0].id,
          content: '하이라이트 부분이네요!',
          createdAt: timeAgo(15, 'minute'),
          isMine: true,
          ref: { kind: 'video' as const, seconds: 150 },
        },
        {
          commentId: 'vc-150-2',
          userId: MOCK_USERS[4].id,
          content: '완전 동의합니다!',
          createdAt: timeAgo(14, 'minute'),
          isMine: false,
          parentId: 'vc-150-1',
          isReply: true,
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 15, active: true },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 8, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 210초 - good 우세 (총합: 14)
    {
      timestampMs: 210_000,
      comments: [],
      reactions: [
        { type: 'fire' as const, count: 3, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 9, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 270초 - bad 우세 (총합: 7)
    {
      timestampMs: 270_000,
      comments: [
        {
          commentId: 'vc-270-1',
          userId: MOCK_USERS[2].id,
          content: '이 부분은 개선이 필요해 보여요.',
          createdAt: timeAgo(20, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 270 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 0, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 4, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // ===== 후반부 (300~500초) =====
    // 330초 - fire 우세 (총합: 18)
    {
      timestampMs: 330_000,
      comments: [
        {
          commentId: 'vc-330-1',
          userId: MOCK_USERS[1].id,
          content: '다시 재미있어졌네요!',
          createdAt: timeAgo(25, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 330 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 10, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 5, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 390초 - good 우세 (총합: 11)
    {
      timestampMs: 390_000,
      comments: [],
      reactions: [
        { type: 'fire' as const, count: 2, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 8, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 450초 - fire 우세 (총합: 16)
    {
      timestampMs: 450_000,
      comments: [
        {
          commentId: 'vc-450-1',
          userId: MOCK_USERS[3].id,
          content: '클라이막스 부분이네요!',
          createdAt: timeAgo(30, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 450 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 9, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 5, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // ===== 엔딩부분 (500~596초) =====
    // 520초 - sleepy 우세 (총합: 6)
    {
      timestampMs: 520_000,
      comments: [],
      reactions: [
        { type: 'fire' as const, count: 1, active: false },
        { type: 'sleepy' as const, count: 3, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },

    // 560초 - good 우세 (총합: 13) - 엔딩 크레딧 호평
    {
      timestampMs: 560_000,
      comments: [
        {
          commentId: 'vc-560-1',
          userId: MOCK_USERS[4].id,
          content: '엔딩 크레딧도 예쁘네요!',
          createdAt: timeAgo(35, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 560 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 3, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 7, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 100, active: false },
      ],
    },

    // 590초 - fire 우세 (총합: 22) - 마지막 장면 인기!
    {
      timestampMs: 590_000,
      comments: [
        {
          commentId: 'vc-590-1',
          userId: MOCK_USERS[0].id,
          content: '마무리가 정말 좋았어요!',
          createdAt: timeAgo(40, 'minute'),
          isMine: true,
          ref: { kind: 'video' as const, seconds: 590 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 12, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 8, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },
  ],
};
