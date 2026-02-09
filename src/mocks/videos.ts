import type {
  VideoDetailDto,
  VideoListItemDto,
  VideoSlideTimelineItemDto,
  VideoTimelineCommentDto,
  VideoTimelineDto,
  VideoTimelineReactionDto,
} from '@/api/dto';

// ============================================================================
// Mock 영상 목록 데이터
// ============================================================================

export const mockVideoList: VideoListItemDto[] = [
  {
    videoId: '1',
    title: '테스트 영상',
    status: 'ready',
    durationSeconds: 596,
    thumbnailUrl: 'https://picsum.photos/seed/video1/640/360',
    createdAt: '2026-02-03T13:20:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '2',
    title: '내 발표 리허설',
    status: 'ready',
    durationSeconds: 95,
    thumbnailUrl: 'https://picsum.photos/seed/video2/640/360',
    createdAt: '2026-02-03T10:30:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '3',
    title: 'Q4 마케팅 전략 발표',
    status: 'ready',
    durationSeconds: 420,
    thumbnailUrl: 'https://picsum.photos/seed/video3/640/360',
    createdAt: '2026-02-02T15:45:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '4',
    title: '신제품 소개',
    status: 'ready',
    durationSeconds: 180,
    thumbnailUrl: 'https://picsum.photos/seed/video4/640/360',
    createdAt: '2026-02-01T09:00:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '5',
    title: '프로젝트 최종 발표',
    status: 'ready',
    durationSeconds: 300,
    thumbnailUrl: 'https://picsum.photos/seed/video5/640/360',
    createdAt: '2026-01-31T14:20:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '6',
    title: '주간 업무 보고',
    status: 'ready',
    durationSeconds: 240,
    thumbnailUrl: 'https://picsum.photos/seed/video6/640/360',
    createdAt: '2026-01-30T11:00:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '7',
    title: '고객 피드백 분석',
    status: 'processing',
    durationSeconds: 360,
    thumbnailUrl: null,
    createdAt: '2026-01-29T16:30:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '8',
    title: '2026 전략 수립',
    status: 'ready',
    durationSeconds: 480,
    thumbnailUrl: 'https://picsum.photos/seed/video8/640/360',
    createdAt: '2026-01-28T13:15:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '9',
    title: '팀 빌딩 아이디어',
    status: 'ready',
    durationSeconds: 150,
    thumbnailUrl: 'https://picsum.photos/seed/video9/640/360',
    createdAt: '2026-01-27T10:45:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
  {
    videoId: '10',
    title: '디자인 시스템 소개',
    status: 'failed',
    durationSeconds: 270,
    thumbnailUrl: null,
    createdAt: '2026-01-26T14:00:00.000Z',
    viewCount: 0,
    reactionCount: 0,
    replyCount: 0,
    rootCommentCount: 0,
  },
];

// ============================================================================
// Mock 영상 상세 데이터
// ============================================================================

export const mockVideoDetails: Record<string, VideoDetailDto> = {
  '1': {
    videoId: '1',
    title: '테스트 영상',
    status: 'ready',
    durationSeconds: 596,
    width: 1920,
    height: 1080,
    fps: 30,
    hlsMasterUrl: '/p1.webm',
    thumbnailUrl: 'https://picsum.photos/seed/video1/640/360',
    createdAt: '2026-02-03T13:20:00.000Z',
  },
  '2': {
    videoId: '2',
    title: '내 발표 리허설',
    status: 'ready',
    durationSeconds: 95,
    width: 1920,
    height: 1080,
    fps: 30,
    hlsMasterUrl: 'https://example.com/videos/2/master.m3u8',
    thumbnailUrl: 'https://picsum.photos/seed/video2/640/360',
    createdAt: '2026-02-03T10:30:00.000Z',
  },
  '3': {
    videoId: '3',
    title: 'Q4 마케팅 전략 발표',
    status: 'ready',
    durationSeconds: 420,
    width: 1920,
    height: 1080,
    fps: 30,
    hlsMasterUrl: 'https://example.com/videos/3/master.m3u8',
    thumbnailUrl: 'https://picsum.photos/seed/video3/640/360',
    createdAt: '2026-02-02T15:45:00.000Z',
  },
};

// ============================================================================
// Mock 타임라인 데이터
// ============================================================================

export const mockTimelines: Record<string, VideoTimelineDto> = {
  '1': {
    reactions: [
      {
        timestampMs: 3000,
        emojiType: 'fire',
        count: 8,
      },
      {
        timestampMs: 15000,
        emojiType: 'good',
        count: 7,
      },
      {
        timestampMs: 28000,
        emojiType: 'sleepy',
        count: 5,
      },
      {
        timestampMs: 45000,
        emojiType: 'fire',
        count: 12,
      },
      {
        timestampMs: 90000,
        emojiType: 'confused',
        count: 6,
      },
      {
        timestampMs: 150000,
        emojiType: 'fire',
        count: 15,
      },
      {
        timestampMs: 210000,
        emojiType: 'good',
        count: 9,
      },
      {
        timestampMs: 270000,
        emojiType: 'bad',
        count: 4,
      },
      {
        timestampMs: 330000,
        emojiType: 'fire',
        count: 10,
      },
      {
        timestampMs: 390000,
        emojiType: 'good',
        count: 8,
      },
      {
        timestampMs: 450000,
        emojiType: 'fire',
        count: 9,
      },
      {
        timestampMs: 520000,
        emojiType: 'sleepy',
        count: 3,
      },
      {
        timestampMs: 560000,
        emojiType: 'confused',
        count: 100,
      },
      {
        timestampMs: 590000,
        emojiType: 'fire',
        count: 12,
      },
    ],
    comments: [
      {
        commentId: 'vc-1',
        timestampMs: 3000,
        content: '오프닝이 멋있네요!',
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        user: {
          userId: 'user1',
          name: '김예원',
        },
      },
      {
        commentId: 'vc-3',
        timestampMs: 15000,
        content: '배경 음악이 좋습니다.',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user: {
          userId: 'user2',
          name: '이철수',
        },
      },
      {
        commentId: 'vc-45-1',
        timestampMs: 45000,
        content: '여기 정말 좋아요!',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        user: {
          userId: 'user3',
          name: '박영희',
        },
      },
      {
        commentId: 'vc-90-1',
        timestampMs: 90000,
        content: '이 부분이 좀 어려웠어요.',
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        user: {
          userId: 'user4',
          name: '최민수',
        },
      },
      {
        commentId: 'vc-150-1',
        timestampMs: 150000,
        content: '하이라이트 부분이네요!',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: {
          userId: 'user1',
          name: '김예원',
        },
        replies: [
          {
            replyId: 'vc-150-2',
            content: '완전 동의합니다!',
            createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
            user: {
              userId: 'user5',
              name: '정지훈',
            },
          },
        ],
      },
      {
        commentId: 'vc-270-1',
        timestampMs: 270000,
        content: '이 부분은 개선이 필요해 보여요.',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        user: {
          userId: 'user2',
          name: '이철수',
        },
      },
      {
        commentId: 'vc-330-1',
        timestampMs: 330000,
        content: '다시 재미있어졌네요!',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        user: {
          userId: 'user3',
          name: '박영희',
        },
      },
      {
        commentId: 'vc-450-1',
        timestampMs: 450000,
        content: '클라이막스 부분이네요!',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user: {
          userId: 'user4',
          name: '최민수',
        },
      },
      {
        commentId: 'vc-560-1',
        timestampMs: 560000,
        content: '엔딩 크레딧도 예쁘네요!',
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        user: {
          userId: 'user5',
          name: '정지훈',
        },
      },
      {
        commentId: 'vc-590-1',
        timestampMs: 590000,
        content: '마무리가 정말 좋았어요!',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        user: {
          userId: 'user1',
          name: '김예원',
        },
      },
    ],
  },
  '2': {
    reactions: [],
    comments: [],
  },
  '3': {
    reactions: [
      {
        timestampMs: 60000,
        emojiType: 'good',
        count: 10,
      },
    ],
    comments: [
      {
        commentId: 'c3',
        timestampMs: 120000,
        content: 'Q4 전략 잘 봤습니다',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: {
          userId: 'user6',
          name: '강민지',
        },
      },
    ],
  },
};

// ============================================================================
// Mock 슬라이드 타임라인 데이터
// ============================================================================

export const mockSlideTimelines: Record<string, VideoSlideTimelineItemDto[]> = {
  '1': [
    { slideId: '1', timestampMs: 0 },
    { slideId: '2', timestampMs: 60000 },
    { slideId: '3', timestampMs: 120000 },
    { slideId: '4', timestampMs: 180000 },
    { slideId: '5', timestampMs: 240000 },
    { slideId: '6', timestampMs: 300000 },
    { slideId: '7', timestampMs: 360000 },
    { slideId: '8', timestampMs: 420000 },
    { slideId: '9', timestampMs: 480000 },
    { slideId: '10', timestampMs: 540000 },
  ],
  '2': [
    { slideId: '1', timestampMs: 0 },
    { slideId: '2', timestampMs: 19000 },
    { slideId: '3', timestampMs: 38000 },
    { slideId: '4', timestampMs: 57000 },
    { slideId: '5', timestampMs: 76000 },
  ],
  '3': [
    { slideId: '1', timestampMs: 0 },
    { slideId: '2', timestampMs: 28000 },
    { slideId: '3', timestampMs: 56000 },
    { slideId: '4', timestampMs: 84000 },
    { slideId: '5', timestampMs: 112000 },
    { slideId: '6', timestampMs: 140000 },
    { slideId: '7', timestampMs: 168000 },
    { slideId: '8', timestampMs: 196000 },
    { slideId: '9', timestampMs: 224000 },
    { slideId: '10', timestampMs: 252000 },
    { slideId: '11', timestampMs: 280000 },
    { slideId: '12', timestampMs: 308000 },
    { slideId: '13', timestampMs: 336000 },
    { slideId: '14', timestampMs: 364000 },
    { slideId: '15', timestampMs: 392000 },
  ],
};

// ============================================================================
// Helper 함수
// ============================================================================

/**
 * 검색어로 영상 필터링
 */
export function filterVideosBySearch(
  videos: VideoListItemDto[],
  search: string,
): VideoListItemDto[] {
  if (!search) return videos;
  const lowerSearch = search.toLowerCase();
  return videos.filter((v) => v.title.toLowerCase().includes(lowerSearch));
}

/**
 * 상태로 영상 필터링
 */
export function filterVideosByStatus(
  videos: VideoListItemDto[],
  status: string,
): VideoListItemDto[] {
  if (!status || status === 'all') return videos;
  return videos.filter((v) => v.status === status);
}

/**
 * 정렬
 */
export function sortVideos(videos: VideoListItemDto[], sort: string): VideoListItemDto[] {
  const sorted = [...videos];

  if (sort === 'oldest') {
    return sorted.reverse();
  }

  // 기본: 최신순 (이미 최신순으로 정렬되어 있음)
  return sorted;
}
