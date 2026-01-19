import type { Project } from '@/types/project';

const dates = {
  daysAgo: (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}. ${mm}. ${dd}`;
  },
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Q4 마케팅 전략 발표',
    updatedAt: dates.daysAgo(1),
    pageCount: 11,
    commentCount: 0,
    reactionCount: 0,
    viewCount: 18,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Q4',
  },
  {
    id: 'p2',
    title: '신제품 론칭 계획',
    updatedAt: dates.daysAgo(2),
    pageCount: 8,
    commentCount: 0,
    reactionCount: 0,
    viewCount: 23,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Launch',
  },
  {
    id: 'p3',
    title: '2024 연간 실적 리뷰',
    updatedAt: dates.daysAgo(3),
    pageCount: 17,
    commentCount: 1,
    reactionCount: 2,
    viewCount: 94,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Review',
  },
  {
    id: 'p4',
    title: '브랜드 리뉴얼 컨셉 제안서',
    updatedAt: dates.daysAgo(5),
    pageCount: 14,
    commentCount: 3,
    reactionCount: 6,
    viewCount: 57,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Brand',
  },
  {
    id: 'p5',
    title: '서비스 온보딩 개선안',
    updatedAt: dates.daysAgo(6),
    pageCount: 9,
    commentCount: 2,
    reactionCount: 1,
    viewCount: 36,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Onboarding',
  },
  {
    id: 'p6',
    title: '시장 경쟁사 분석 보고서',
    updatedAt: dates.daysAgo(8),
    pageCount: 12,
    commentCount: 4,
    reactionCount: 3,
    viewCount: 61,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Market',
  },
  {
    id: 'p7',
    title: 'AI 기능 기획 초안',
    updatedAt: dates.daysAgo(9),
    pageCount: 6,
    commentCount: 0,
    reactionCount: 1,
    viewCount: 29,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=AI',
  },
  {
    id: 'p8',
    title: '파트너십 제안서',
    updatedAt: dates.daysAgo(12),
    pageCount: 10,
    commentCount: 1,
    reactionCount: 0,
    viewCount: 41,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Partner',
  },
  {
    id: 'p9',
    title: '2025 로드맵',
    updatedAt: dates.daysAgo(15),
    pageCount: 20,
    commentCount: 5,
    reactionCount: 9,
    viewCount: 120,
    thumbnailUrl: 'https://via.placeholder.com/320x180?text=Roadmap',
  },
];
