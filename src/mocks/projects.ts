import type { Presentation } from '@/types/presentation';

import { daysAgo } from './utils';

export const MOCK_PROJECTS: Presentation[] = [
  {
    projectId: 'p1',
    title: '네이버 지도 리브랜딩, 새로운 여정의 시작',
    userName: '김또랑',
    updatedAt: daysAgo(1),
    reactionCount: 325,
    viewCount: 18,
    thumbnailUrl: '/thumbnails/p1/0.webp',
    slideCount: 70,
    feedbackCount: 19,
    durationSeconds: 120, // 2분
    createdAt: daysAgo(2),
  },
  {
    projectId: 'p2',
    title: '당근페이 송금의 플랫폼화: 중고거래 채팅 벗어나기',
    userName: '춘식이',
    updatedAt: daysAgo(2),
    reactionCount: 0,
    viewCount: 23,
    thumbnailUrl: '/thumbnails/p2/0.webp',
    slideCount: 59,
    feedbackCount: 0,
    durationSeconds: 180, // 3분
    createdAt: daysAgo(3),
  },
  {
    projectId: 'p3',
    title: '강남언니 회사소개서',
    userName: '라이언',
    updatedAt: daysAgo(6),
    reactionCount: 1,
    viewCount: 36,
    thumbnailUrl: '/thumbnails/p3/0.webp',
    slideCount: 17,
    feedbackCount: 2,
    durationSeconds: 300, // 5분
    createdAt: daysAgo(7),
  },
  {
    projectId: 'p4',
    title: '모빌리티 혁신 플랫폼, 소카',
    userName: '어피치',
    updatedAt: daysAgo(8),
    reactionCount: 3,
    viewCount: 61,
    thumbnailUrl: '/thumbnails/p4/0.webp',
    slideCount: 28,
    feedbackCount: 4,
    durationSeconds: 360, // 6분
    createdAt: daysAgo(9),
  },
];
