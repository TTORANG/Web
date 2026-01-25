import type { Project } from '@/types/project';

import { daysAgo } from './utils';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: '네이버 지도 리브랜딩, 새로운 여정의 시작',
    updatedAt: daysAgo(1),
    durationMinutes: 2,
    pageCount: 70,
    commentCount: 19,
    reactionCount: 325,
    viewCount: 18,
    thumbnailUrl: '/thumbnails/p1/0.webp',
  },
  {
    id: 'p2',
    title: '당근페이 송금의 플랫폼화: 중고거래 채팅 벗어나기',
    updatedAt: daysAgo(2),
    durationMinutes: 3,
    pageCount: 59,
    commentCount: 0,
    reactionCount: 0,
    viewCount: 23,
    thumbnailUrl: '/thumbnails/p2/0.webp',
  },
  {
    id: 'p3',
    title: '강남언니 회사소개서',
    updatedAt: daysAgo(6),
    durationMinutes: 5,
    pageCount: 17,
    commentCount: 2,
    reactionCount: 1,
    viewCount: 36,
    thumbnailUrl: '/thumbnails/p3/0.webp',
  },
  {
    id: 'p4',
    title: '모빌리티 혁신 플랫폼, 소카',
    updatedAt: daysAgo(8),
    pageCount: 28,
    durationMinutes: 6,
    commentCount: 4,
    reactionCount: 3,
    viewCount: 61,
    thumbnailUrl: '/thumbnails/p4/0.webp',
  },
];
