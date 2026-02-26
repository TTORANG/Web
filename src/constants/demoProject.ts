import type {
  GetProjectScriptsResponseDto,
  GetScriptResponseDto,
  GetScriptVersionHistoryResponseDto,
} from '@/api/dto';
import type {
  ReadPresentationAnalyticsSummaryDto,
  ReadRecentCommentListResponseDto,
  ReadSlideAnalyticsResponseDto,
  ReadSlideRetentionResponseDto,
  ReadVideoExitAnalyticsResponseDto,
  ReadVideoRetentionResponseDto,
} from '@/api/dto/analytics.dto';
import type { ReadReactionSummaryDto } from '@/api/dto/reactions.dto';
import type { VideoListItemDto } from '@/api/dto/video.dto';
import type { Comment } from '@/types/comment';
import type { Presentation } from '@/types/presentation';
import type { ReactionType } from '@/types/script';

import { DEMO_PRESENTATION } from './demoPresentation';

export const DEMO_PROJECT_ID = 'demo';
export const DEMO_SHARE_PATH = '/demo/feedback';
export const DEMO_VIDEO_ID = 'demo-video-1';

const DEMO_CREATED_AT = '2026-02-20T09:00:00.000Z';
const DEMO_UPDATED_AT = '2026-02-26T11:00:00.000Z';

const REACTION_KEYS: ReactionType[] = ['fire', 'sleepy', 'good', 'bad', 'confused'];

const DEMO_SLIDE_REACTION_SUMMARY_FALLBACK: Record<ReactionType, number> = {
  fire: 0,
  sleepy: 0,
  good: 0,
  bad: 0,
  confused: 0,
};

const sumReactionCounts = (counts: Record<ReactionType, number>) =>
  REACTION_KEYS.reduce((sum, key) => sum + (counts[key] ?? 0), 0);

export const DEMO_SLIDES = DEMO_PRESENTATION.slides;

const DEMO_SLIDE_ID_SET = new Set(DEMO_SLIDES.map((slide) => slide.slideId));

export function isDemoProject(projectId?: string | null): boolean {
  return projectId === DEMO_PROJECT_ID;
}

export function isDemoSlideId(slideId?: string | null): boolean {
  if (!slideId) return false;
  return DEMO_SLIDE_ID_SET.has(slideId);
}

export function getDemoSlideById(slideId?: string | null) {
  if (!slideId) return undefined;
  return DEMO_SLIDES.find((slide) => slide.slideId === slideId);
}

export const DEMO_VIDEO_LIST_ITEMS: VideoListItemDto[] = [
  {
    videoId: DEMO_VIDEO_ID,
    title: '또랑 데모 리허설 #1 (초안)',
    status: 'ready',
    durationSeconds: 182,
    thumbnailUrl: '/thumbnails/p1/8.jpg',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: 74,
    viewCount: 118,
    reactionCount: 152,
    replyCount: 9,
    rootCommentCount: 21,
    createdAt: '2026-02-22T10:00:00.000Z',
  },
  {
    videoId: 'demo-video-2',
    title: '또랑 데모 리허설 #2 (개선본)',
    status: 'ready',
    durationSeconds: 176,
    thumbnailUrl: '/thumbnails/p1/5.jpg',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: 58,
    viewCount: 96,
    reactionCount: 129,
    replyCount: 7,
    rootCommentCount: 17,
    createdAt: '2026-02-22T13:30:00.000Z',
  },
  {
    videoId: 'demo-video-3',
    title: '또랑 데모 리허설 #3 (최종본)',
    status: 'ready',
    durationSeconds: 168,
    thumbnailUrl: '/thumbnails/p1/2.jpg',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: 42,
    viewCount: 98,
    reactionCount: 117,
    replyCount: 5,
    rootCommentCount: 14,
    createdAt: '2026-02-22T16:00:00.000Z',
  },
];

const resolveDemoVideoId = (videoId?: string | null): string => {
  if (!videoId) return DEMO_VIDEO_ID;
  return DEMO_VIDEO_LIST_ITEMS.some((video) => String(video.videoId) === String(videoId))
    ? String(videoId)
    : DEMO_VIDEO_ID;
};

export const DEMO_PRESENTATION_DETAIL: Presentation = {
  projectId: DEMO_PROJECT_ID,
  title: DEMO_PRESENTATION.title,
  status: 'completed',
  thumbnailUrl: DEMO_SLIDES[0]?.imageUrl,
  slideCount: DEMO_SLIDES.length,
  feedbackCount: 174,
  reactionCount: DEMO_VIDEO_LIST_ITEMS.reduce((sum, video) => sum + (video.reactionCount ?? 0), 0),
  viewCount: 312,
  durationSeconds: 182,
  userName: DEMO_PRESENTATION.publisherName,
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
};

export const DEMO_SHAREABLE_VIDEOS = DEMO_VIDEO_LIST_ITEMS.map((video) => ({
  id: String(video.videoId),
  title: video.title,
  thumbnailUrl: video.thumbnailUrl,
  createdAt: video.createdAt,
}));

export const DEMO_PROJECT_SCRIPTS: GetProjectScriptsResponseDto = {
  message: 'demo',
  projectId: DEMO_PROJECT_ID,
  scripts: DEMO_SLIDES.map((slide) => ({
    slideId: slide.slideId,
    title: slide.title,
    scriptText: slide.script,
  })),
};

export function getDemoScript(slideId: string): GetScriptResponseDto {
  const slide = getDemoSlideById(slideId);
  const scriptText = slide?.script ?? '';
  return {
    message: 'demo',
    slideId,
    scriptText,
    charCount: scriptText.length,
    estimatedDurationSeconds: Math.max(3, Math.round(scriptText.length / 6)),
    createdAt: DEMO_CREATED_AT,
    updatedAt: DEMO_UPDATED_AT,
  };
}

export const DEMO_SCRIPT_VERSIONS_BY_SLIDE_ID: Record<
  string,
  GetScriptVersionHistoryResponseDto[]
> = Object.fromEntries(
  DEMO_SLIDES.map((slide) => [
    slide.slideId,
    [
      {
        versionNumber: 2,
        scriptText: slide.script,
        charCount: slide.script.length,
        createdAt: '2026-02-26T11:00:00.000Z',
      },
      {
        versionNumber: 1,
        scriptText: `${slide.script}\n\n(초안)`,
        charCount: `${slide.script}\n\n(초안)`.length,
        createdAt: '2026-02-24T09:00:00.000Z',
      },
    ],
  ]),
);

export const DEMO_SLIDE_COMMENTS_BY_SLIDE_ID: Record<string, Comment[]> = {
  '101': [
    {
      commentId: 'demo-slide-comment-101-1',
      userId: 'demo-user-1',
      userName: '차분한 수달',
      content: '시작 문장이 짧고 강해서 바로 집중됐어요.',
      createdAt: '2026-02-26T10:02:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 0 },
    },
  ],
  '104': [
    {
      commentId: 'demo-slide-comment-104-1',
      userId: 'demo-user-2',
      userName: '예리한 매',
      content: '연습과 피드백의 연결이 핵심이라 메시지가 선명합니다.',
      createdAt: '2026-02-26T10:04:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 3 },
    },
  ],
  '105': [
    {
      commentId: 'demo-slide-comment-105-1',
      userId: 'demo-user-3',
      userName: '단호한 호랑이',
      content: '실제 불편 사례가 조금 더 구체적이면 더 설득될 것 같아요.',
      createdAt: '2026-02-26T10:05:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 4 },
    },
    {
      commentId: 'demo-slide-comment-105-1-reply',
      parentId: 'demo-slide-comment-105-1',
      isReply: true,
      userId: 'demo-user-4',
      userName: '꼼꼼한 다람쥐',
      content: '동의해요. 첨부 누락 사례처럼 한 가지 실례를 넣어보면 좋겠네요.',
      createdAt: '2026-02-26T10:06:00.000Z',
      isMine: false,
    },
  ],
  '108': [
    {
      commentId: 'demo-slide-comment-108-1',
      userId: 'demo-user-5',
      userName: '민첩한 여우',
      content: '이탈 구간 인사이트가 보여서 발표 개선 포인트가 명확해집니다.',
      createdAt: '2026-02-26T10:08:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 7 },
    },
  ],
  '109': [
    {
      commentId: 'demo-slide-comment-109-1',
      userId: 'demo-user-6',
      userName: '느긋한 고양이',
      content: '마무리 CTA가 분명해서 실행 흐름이 잘 보입니다.',
      createdAt: '2026-02-26T10:09:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 8 },
    },
  ],
};

const DEMO_SLIDE_REACTION_SUMMARY_BY_VIDEO_ID: Record<
  string,
  Record<string, Record<ReactionType, number>>
> = {
  [DEMO_VIDEO_ID]: {
    '101': { fire: 9, sleepy: 1, good: 17, bad: 2, confused: 4 },
    '102': { fire: 8, sleepy: 2, good: 14, bad: 4, confused: 5 },
    '103': { fire: 6, sleepy: 3, good: 11, bad: 5, confused: 6 },
    '104': { fire: 5, sleepy: 4, good: 10, bad: 7, confused: 6 },
    '105': { fire: 4, sleepy: 6, good: 8, bad: 11, confused: 8 },
    '106': { fire: 7, sleepy: 3, good: 13, bad: 4, confused: 6 },
    '107': { fire: 10, sleepy: 2, good: 18, bad: 3, confused: 4 },
    '108': { fire: 12, sleepy: 1, good: 20, bad: 2, confused: 3 },
    '109': { fire: 8, sleepy: 2, good: 14, bad: 3, confused: 4 },
  },
  'demo-video-2': {
    '101': { fire: 11, sleepy: 1, good: 20, bad: 1, confused: 3 },
    '102': { fire: 10, sleepy: 1, good: 18, bad: 2, confused: 4 },
    '103': { fire: 8, sleepy: 2, good: 15, bad: 3, confused: 4 },
    '104': { fire: 7, sleepy: 2, good: 14, bad: 4, confused: 4 },
    '105': { fire: 6, sleepy: 3, good: 13, bad: 5, confused: 5 },
    '106': { fire: 9, sleepy: 1, good: 19, bad: 2, confused: 3 },
    '107': { fire: 12, sleepy: 1, good: 22, bad: 1, confused: 2 },
    '108': { fire: 14, sleepy: 1, good: 24, bad: 1, confused: 2 },
    '109': { fire: 10, sleepy: 1, good: 18, bad: 2, confused: 3 },
  },
  'demo-video-3': {
    '101': { fire: 12, sleepy: 0, good: 23, bad: 1, confused: 2 },
    '102': { fire: 11, sleepy: 1, good: 21, bad: 1, confused: 2 },
    '103': { fire: 10, sleepy: 1, good: 19, bad: 2, confused: 3 },
    '104': { fire: 9, sleepy: 1, good: 18, bad: 3, confused: 3 },
    '105': { fire: 8, sleepy: 2, good: 16, bad: 6, confused: 5 },
    '106': { fire: 11, sleepy: 0, good: 24, bad: 1, confused: 2 },
    '107': { fire: 15, sleepy: 0, good: 28, bad: 1, confused: 1 },
    '108': { fire: 17, sleepy: 0, good: 30, bad: 1, confused: 1 },
    '109': { fire: 13, sleepy: 0, good: 25, bad: 1, confused: 2 },
  },
};

export const DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID: Record<
  string,
  Record<ReactionType, number>
> = Object.fromEntries(
  DEMO_SLIDES.map((slide) => {
    const totals: Record<ReactionType, number> = { ...DEMO_SLIDE_REACTION_SUMMARY_FALLBACK };

    Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_VIDEO_ID).forEach((videoSummary) => {
      const counts = videoSummary[slide.slideId];
      if (!counts) return;
      REACTION_KEYS.forEach((key) => {
        totals[key] += counts[key] ?? 0;
      });
    });

    return [slide.slideId, totals];
  }),
);

export function getDemoSlideReactionSummary(
  slideId: string,
  videoId?: string | null,
): Record<ReactionType, number> {
  if (!videoId) {
    return DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID[slideId] ?? DEMO_SLIDE_REACTION_SUMMARY_FALLBACK;
  }

  const resolvedVideoId = resolveDemoVideoId(videoId);
  return (
    DEMO_SLIDE_REACTION_SUMMARY_BY_VIDEO_ID[resolvedVideoId]?.[slideId] ??
    DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID[slideId] ??
    DEMO_SLIDE_REACTION_SUMMARY_FALLBACK
  );
}

export const DEMO_TOTAL_REACTIONS_SUMMARY: ReadReactionSummaryDto = {
  projectId: DEMO_PROJECT_ID,
  totalReactions: {
    fire: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
      (sum, value) => sum + (value.fire ?? 0),
      0,
    ),
    sleepy: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
      (sum, value) => sum + (value.sleepy ?? 0),
      0,
    ),
    good: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
      (sum, value) => sum + (value.good ?? 0),
      0,
    ),
    bad: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
      (sum, value) => sum + (value.bad ?? 0),
      0,
    ),
    confused: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
      (sum, value) => sum + (value.confused ?? 0),
      0,
    ),
  },
  totalCount: Object.values(DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID).reduce(
    (sum, value) => sum + sumReactionCounts(value),
    0,
  ),
};

export const DEMO_VIDEO_SLIDES_TIMELINE = {
  slides: DEMO_SLIDES.map((slide, index) => ({
    slideId: slide.slideId,
    title: slide.title,
    timestampMs: Math.round((slide.startTime ?? index * 30) * 1000),
  })),
};

export const DEMO_ANALYTICS_SUMMARY: ReadPresentationAnalyticsSummaryDto = {
  videoIds: DEMO_VIDEO_LIST_ITEMS.map((video) => String(video.videoId)),
  totalViews: 312,
  avgDurationSeconds: 129,
  completionRate: 0.69,
  totalFeedbackCount: 174,
};

const DEMO_SLIDE_VIEW_COUNTS = [312, 298, 283, 269, 251, 240, 226, 210, 193];
const DEMO_SLIDE_EXIT_COUNTS = [8, 12, 18, 27, 41, 16, 14, 19, 28];
const DEMO_SLIDE_COMMENT_COUNTS = [14, 12, 10, 16, 19, 9, 8, 13, 11];

export const DEMO_SLIDE_ANALYTICS: ReadSlideAnalyticsResponseDto = {
  slides: DEMO_SLIDES.map((slide, index) => {
    const reactionCount = sumReactionCounts(
      DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID[slide.slideId] ??
        DEMO_SLIDE_REACTION_SUMMARY_FALLBACK,
    );
    const viewCount = DEMO_SLIDE_VIEW_COUNTS[index] ?? 0;
    const exitCount = DEMO_SLIDE_EXIT_COUNTS[index] ?? 0;
    const commentCount = DEMO_SLIDE_COMMENT_COUNTS[index] ?? 0;

    return {
      slideId: slide.slideId,
      slideNum: slide.slideNum ?? index + 1,
      title: slide.title,
      viewCount,
      exitCount,
      exitRate: viewCount > 0 ? Number((exitCount / viewCount).toFixed(2)) : 0,
      reactionCount,
      commentCount,
      feedbackCount: reactionCount + commentCount,
    };
  }),
};

const createVideoRetention = (
  totalSessions: number,
  durationSeconds: number,
  retentionRates: number[],
): ReadVideoRetentionResponseDto => ({
  totalSessions,
  durationSeconds,
  intervalMs: 10000,
  videoRetention: retentionRates.map((rate, index) => ({
    timestampMs: index * 10000,
    sessionCount: Math.max(1, Math.round((totalSessions * rate) / 100)),
    retentionRate: rate / 100,
  })),
});

const DEMO_VIDEO_EXIT_ANALYTICS_BY_VIDEO_ID: Record<string, ReadVideoExitAnalyticsResponseDto> = {
  [DEMO_VIDEO_ID]: {
    exits: [
      { timestampMs: 22000, exitCount: 11, exitRate: 0.09 },
      { timestampMs: 51000, exitCount: 17, exitRate: 0.14 },
      { timestampMs: 76000, exitCount: 23, exitRate: 0.19 },
      { timestampMs: 109000, exitCount: 15, exitRate: 0.12 },
      { timestampMs: 146000, exitCount: 12, exitRate: 0.1 },
    ],
  },
  'demo-video-2': {
    exits: [
      { timestampMs: 28000, exitCount: 8, exitRate: 0.08 },
      { timestampMs: 62000, exitCount: 12, exitRate: 0.13 },
      { timestampMs: 89000, exitCount: 10, exitRate: 0.11 },
      { timestampMs: 121000, exitCount: 14, exitRate: 0.15 },
      { timestampMs: 154000, exitCount: 9, exitRate: 0.1 },
    ],
  },
  'demo-video-3': {
    exits: [
      { timestampMs: 30000, exitCount: 5, exitRate: 0.05 },
      { timestampMs: 74000, exitCount: 9, exitRate: 0.09 },
      { timestampMs: 98000, exitCount: 12, exitRate: 0.12 },
      { timestampMs: 132000, exitCount: 7, exitRate: 0.07 },
      { timestampMs: 158000, exitCount: 6, exitRate: 0.06 },
    ],
  },
};

const DEMO_VIDEO_RETENTION_BY_VIDEO_ID: Record<string, ReadVideoRetentionResponseDto> = {
  [DEMO_VIDEO_ID]: createVideoRetention(
    118,
    182,
    [100, 96, 92, 86, 79, 72, 64, 58, 50, 42, 35, 29, 24, 20, 16, 13, 11, 9, 7],
  ),
  'demo-video-2': createVideoRetention(
    96,
    176,
    [100, 98, 95, 92, 89, 86, 82, 79, 75, 72, 68, 65, 61, 57, 54, 50, 46, 42],
  ),
  'demo-video-3': createVideoRetention(
    98,
    168,
    [100, 99, 97, 95, 93, 91, 88, 86, 84, 81, 79, 76, 73, 70, 67, 64, 61],
  ),
};

const slideSnapshotById = new Map(
  DEMO_SLIDES.map((slide, index) => [
    slide.slideId,
    {
      slideNum: slide.slideNum ?? index + 1,
      title: slide.title,
      imageUrl: slide.imageUrl,
    },
  ]),
);

const createRecentComment = (
  commentId: string,
  content: string,
  timestampMs: number,
  createdAt: string,
  userId: string,
  userName: string,
  slideId: string,
) => {
  const slideSnapshot = slideSnapshotById.get(slideId);

  return {
    commentId,
    content,
    timestampMs,
    createdAt,
    user: {
      userId,
      nickName: userName,
      name: userName,
      profileImageUrl: null,
    },
    slide: {
      slideId,
      slideNum: slideSnapshot?.slideNum ?? 1,
      title: slideSnapshot?.title ?? null,
      imageUrl: slideSnapshot?.imageUrl ?? '',
    },
  };
};

const DEMO_RECENT_COMMENTS_BY_VIDEO_ID: Record<string, ReadRecentCommentListResponseDto> = {
  [DEMO_VIDEO_ID]: {
    comments: [
      createRecentComment(
        'demo-recent-v1-1',
        '현실 제약 설명이 좋아서 공감 포인트가 잘 잡혔어요.',
        39000,
        '2026-02-26T10:11:00.000Z',
        'demo-user-1',
        '차분한 수달',
        '103',
      ),
      createRecentComment(
        'demo-recent-v1-2',
        '기존 방법의 마찰 파트에서 예시 하나만 더 들어가면 좋겠습니다.',
        76000,
        '2026-02-26T10:12:00.000Z',
        'demo-user-2',
        '예리한 매',
        '105',
      ),
      createRecentComment(
        'demo-recent-v1-3',
        '데이터 인사이트 슬라이드에서 bad 반응 원인 분석이 특히 좋았어요.',
        142000,
        '2026-02-26T10:13:00.000Z',
        'demo-user-3',
        '단호한 호랑이',
        '108',
      ),
    ],
  },
  'demo-video-2': {
    comments: [
      createRecentComment(
        'demo-recent-v2-1',
        '초반 도입이 더 짧아져서 몰입이 좋아졌어요.',
        18000,
        '2026-02-26T13:34:00.000Z',
        'demo-user-4',
        '꼼꼼한 다람쥐',
        '102',
      ),
      createRecentComment(
        'demo-recent-v2-2',
        '마찰 사례를 표로 정리한 부분이 전달력이 높습니다.',
        70000,
        '2026-02-26T13:35:00.000Z',
        'demo-user-5',
        '민첩한 여우',
        '105',
      ),
      createRecentComment(
        'demo-recent-v2-3',
        '링크 공유 플로우가 직관적으로 보여서 이해가 빨랐어요.',
        118000,
        '2026-02-26T13:36:00.000Z',
        'demo-user-6',
        '느긋한 고양이',
        '107',
      ),
      createRecentComment(
        'demo-recent-v2-4',
        '마무리 사용 방법이 한 화면에 정리돼서 좋았습니다.',
        162000,
        '2026-02-26T13:37:00.000Z',
        'demo-user-7',
        '담대한 고래',
        '109',
      ),
    ],
  },
  'demo-video-3': {
    comments: [
      createRecentComment(
        'demo-recent-v3-1',
        '오프닝 톤이 안정적이라 전체 흐름이 깔끔해요.',
        12000,
        '2026-02-26T16:02:00.000Z',
        'demo-user-8',
        '신중한 올빼미',
        '101',
      ),
      createRecentComment(
        'demo-recent-v3-2',
        '피드백 마찰 파트에서 bad 반응 원인까지 짚어준 게 좋았습니다.',
        84000,
        '2026-02-26T16:03:00.000Z',
        'demo-user-9',
        '섬세한 펭귄',
        '105',
      ),
      createRecentComment(
        'demo-recent-v3-3',
        '인사이트 슬라이드가 가장 인상 깊었습니다. 데이터 해석이 명확해요.',
        136000,
        '2026-02-26T16:04:00.000Z',
        'demo-user-10',
        '단단한 코알라',
        '108',
      ),
    ],
  },
};

export function getDemoVideoExitAnalytics(
  videoId?: string | null,
): ReadVideoExitAnalyticsResponseDto {
  const resolvedVideoId = resolveDemoVideoId(videoId);
  return (
    DEMO_VIDEO_EXIT_ANALYTICS_BY_VIDEO_ID[resolvedVideoId] ??
    DEMO_VIDEO_EXIT_ANALYTICS_BY_VIDEO_ID[DEMO_VIDEO_ID]
  );
}

export const DEMO_VIDEO_EXIT_ANALYTICS: ReadVideoExitAnalyticsResponseDto =
  getDemoVideoExitAnalytics(DEMO_VIDEO_ID);

export const DEMO_SLIDE_RETENTION: ReadSlideRetentionResponseDto = {
  totalSessions: 312,
  slideRetention: [
    {
      slideId: '101',
      slideNum: 1,
      title: DEMO_SLIDES[0]?.title ?? null,
      sessionCount: 312,
      retentionRate: 1,
    },
    {
      slideId: '102',
      slideNum: 2,
      title: DEMO_SLIDES[1]?.title ?? null,
      sessionCount: 298,
      retentionRate: 0.96,
    },
    {
      slideId: '103',
      slideNum: 3,
      title: DEMO_SLIDES[2]?.title ?? null,
      sessionCount: 283,
      retentionRate: 0.91,
    },
    {
      slideId: '104',
      slideNum: 4,
      title: DEMO_SLIDES[3]?.title ?? null,
      sessionCount: 265,
      retentionRate: 0.85,
    },
    {
      slideId: '105',
      slideNum: 5,
      title: DEMO_SLIDES[4]?.title ?? null,
      sessionCount: 242,
      retentionRate: 0.78,
    },
    {
      slideId: '106',
      slideNum: 6,
      title: DEMO_SLIDES[5]?.title ?? null,
      sessionCount: 229,
      retentionRate: 0.73,
    },
    {
      slideId: '107',
      slideNum: 7,
      title: DEMO_SLIDES[6]?.title ?? null,
      sessionCount: 216,
      retentionRate: 0.69,
    },
    {
      slideId: '108',
      slideNum: 8,
      title: DEMO_SLIDES[7]?.title ?? null,
      sessionCount: 203,
      retentionRate: 0.65,
    },
    {
      slideId: '109',
      slideNum: 9,
      title: DEMO_SLIDES[8]?.title ?? null,
      sessionCount: 188,
      retentionRate: 0.6,
    },
  ],
};

export function getDemoVideoRetention(videoId?: string | null): ReadVideoRetentionResponseDto {
  const resolvedVideoId = resolveDemoVideoId(videoId);
  return (
    DEMO_VIDEO_RETENTION_BY_VIDEO_ID[resolvedVideoId] ??
    DEMO_VIDEO_RETENTION_BY_VIDEO_ID[DEMO_VIDEO_ID]
  );
}

export const DEMO_VIDEO_RETENTION: ReadVideoRetentionResponseDto =
  getDemoVideoRetention(DEMO_VIDEO_ID);

export function getDemoRecentComments(videoId?: string | null): ReadRecentCommentListResponseDto {
  const resolvedVideoId = resolveDemoVideoId(videoId);
  return (
    DEMO_RECENT_COMMENTS_BY_VIDEO_ID[resolvedVideoId] ??
    DEMO_RECENT_COMMENTS_BY_VIDEO_ID[DEMO_VIDEO_ID]
  );
}

export const DEMO_RECENT_COMMENTS: ReadRecentCommentListResponseDto =
  getDemoRecentComments(DEMO_VIDEO_ID);
