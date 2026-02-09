// src/mocks/videos.ts
import type { MockVideo, VideoFeedback } from '@/types/video';

import { MOCK_USERS } from './users';
import { timeAgo } from './utils';

/**
 * Mock Videos 목록 (영상 목록 조회용)
 */
export const MOCK_VIDEOS: MockVideo[] = [
  {
    id: 1,
    projectId: 'p1',
    title: '테스트 영상',
    createdAt: '2026-02-03T13:20:00.000Z',
    durationSeconds: 596,
    slideCount: 10,
    rootCommentCount: 8,
    replyCount: 7,
    reactionCount: 156,
    viewCount: 42,
  },
  {
    id: 2,
    projectId: 'p1',
    title: '내 발표 리허설',
    createdAt: '2026-02-03T10:30:00.000Z',
    durationSeconds: 95,
    slideCount: 5,
    rootCommentCount: 2,
    replyCount: 1,
    reactionCount: 7,
    viewCount: 4,
  },
  {
    id: 3,
    projectId: 'p1',
    title: 'Q4 마케팅 전략 발표',
    createdAt: '2026-02-02T15:45:00.000Z',
    durationSeconds: 420,
    slideCount: 15,
    rootCommentCount: 5,
    replyCount: 3,
    reactionCount: 34,
    viewCount: 18,
  },
  {
    id: 4,
    projectId: 'p2',
    title: '신제품 소개',
    createdAt: '2026-02-01T09:00:00.000Z',
    durationSeconds: 180,
    slideCount: 8,
    rootCommentCount: 3,
    replyCount: 2,
    reactionCount: 15,
    viewCount: 12,
  },
  {
    id: 5,
    projectId: 'p2',
    title: '프로젝트 최종 발표',
    createdAt: '2026-01-31T14:20:00.000Z',
    durationSeconds: 300,
    slideCount: 12,
    rootCommentCount: 7,
    replyCount: 5,
    reactionCount: 48,
    viewCount: 25,
  },
  {
    id: 6,
    projectId: 'p2',
    title: '주간 업무 보고',
    createdAt: '2026-01-30T11:00:00.000Z',
    durationSeconds: 240,
    slideCount: 6,
    rootCommentCount: 1,
    replyCount: 0,
    reactionCount: 5,
    viewCount: 8,
  },
  {
    id: 7,
    projectId: 'p1',
    title: '고객 피드백 분석',
    createdAt: '2026-01-29T16:30:00.000Z',
    durationSeconds: 360,
    slideCount: 18,
    rootCommentCount: 4,
    replyCount: 2,
    reactionCount: 22,
    viewCount: 15,
  },
  {
    id: 8,
    projectId: 'p1',
    title: '2026 전략 수립',
    createdAt: '2026-01-28T13:15:00.000Z',
    durationSeconds: 480,
    slideCount: 20,
    rootCommentCount: 9,
    replyCount: 6,
    reactionCount: 67,
    viewCount: 31,
  },
  {
    id: 9,
    projectId: 'p2',
    title: '팀 빌딩 아이디어',
    createdAt: '2026-01-27T10:45:00.000Z',
    durationSeconds: 150,
    slideCount: 7,
    rootCommentCount: 6,
    replyCount: 8,
    reactionCount: 41,
    viewCount: 22,
  },
  {
    id: 10,
    projectId: 'p2',
    title: '디자인 시스템 소개',
    createdAt: '2026-01-26T14:00:00.000Z',
    durationSeconds: 270,
    slideCount: 11,
    rootCommentCount: 3,
    replyCount: 1,
    reactionCount: 18,
    viewCount: 10,
  },
];

/**
 * 테스트용 웹캠 영상 피드백 데이터 (영상 상세/재생 페이지용)
 * - duration: 596초 (9:56)
 * - 영상 전체에 걸쳐 다양한 시간대에 feedbacks 분포
 * - 상위 10개 세그먼트가 재생바에 하이라이트로 표시됨
 */
export const MOCK_VIDEO: VideoFeedback = {
  videoId: '1',
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

    // 560초 - confused 우세 (총합: 113) - 엔딩 크레딧
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
