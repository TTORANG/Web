/**
 * 웹캠 녹화 영상 피드백용 목데이터
 * - 영상별 댓글, 리액션 관리
 * - MOCK_USERS 기반으로 작성자 지정
 */
import type { VideoFeedback } from '@/types/video';

import { MOCK_USERS } from './users';
import { timeAgo } from './utils';

/**
 * 테스트용 웹캠 영상
 */
export const MOCK_VIDEO: VideoFeedback = {
  videoId: 'vid-1',
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  title: '테스트 영상',
  duration: 596,
  comments: [],
  reactionEvents: [],
  feedbacks: [
    // 5초 구간
    {
      timestamp: 5,
      comments: [
        {
          id: 'vc-1', // vc: video comment
          authorId: MOCK_USERS[0].id, // 김또랑
          content: '오프닝이 멋있네요!',
          timestamp: timeAgo(2, 'minute'),
          isMine: true,
          ref: { kind: 'video' as const, seconds: 5 },
        },
        {
          id: 'vc-2',
          authorId: MOCK_USERS[1].id, // 춘식이
          content: '동의합니다! 매우 전문적인 느낌입니다.',
          timestamp: timeAgo(1, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 5 },
          parentId: 'vc-1',
          isReply: true,
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 2, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 0, active: false },
      ],
    },

    // 15초 구간
    {
      timestamp: 15,
      comments: [
        {
          id: 'vc-3',
          authorId: MOCK_USERS[2].id, // 라이언
          content: '배경 음악이 좋습니다.',
          timestamp: timeAgo(5, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 15 },
        },
        {
          id: 'vc-4',
          authorId: MOCK_USERS[3].id, // 어피치
          content: '음악 선정이 정말 좋네요. 어디서 구했나요?',
          timestamp: timeAgo(4, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 15 },
          parentId: 'vc-3',
          isReply: true,
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 0, active: false },
        { type: 'sleepy' as const, count: 0, active: false },
        { type: 'good' as const, count: 3, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 0, active: false },
      ],
    },

    // 17초 구간
    {
      timestamp: 17,
      comments: [
        {
          id: 'vc-5',
          authorId: MOCK_USERS[4].id, // 가나디
          content: '같은 구간에서 누적이 되나 테스트합니다.',
          timestamp: timeAgo(3, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 17 },
        },
        {
          id: 'vc-6',
          authorId: MOCK_USERS[0].id, // 김또랑
          content: '네, 맞습니다. 이 부분은 특히 신경을 많이 썼어요.',
          timestamp: timeAgo(2, 'minute'),
          isMine: true,
          ref: { kind: 'video' as const, seconds: 17 },
          parentId: 'vc-5',
          isReply: true,
        },
        {
          id: 'vc-7',
          authorId: MOCK_USERS[1].id, // 춘식이
          content: '좋은 결과네요!',
          timestamp: timeAgo(1, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 17 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 5, active: false },
        { type: 'sleepy' as const, count: 4, active: false },
        { type: 'good' as const, count: 3, active: false },
        { type: 'bad' as const, count: 0, active: false },
        { type: 'confused' as const, count: 990, active: false },
      ],
    },

    {
      timestamp: 21,
      comments: [
        {
          id: 'vc-21-1',
          authorId: MOCK_USERS[4].id, // 가나디
          content: '21초 테스트 댓글입니다.',
          timestamp: timeAgo(3, 'minute'),
          isMine: false,
          ref: { kind: 'video' as const, seconds: 21 },
        },
      ],
      reactions: [
        { type: 'fire' as const, count: 1, active: false },
        { type: 'sleepy' as const, count: 1, active: false },
        { type: 'good' as const, count: 1, active: false },
        { type: 'bad' as const, count: 1, active: false },
        { type: 'confused' as const, count: 1, active: false },
      ],
    },
  ],
};
