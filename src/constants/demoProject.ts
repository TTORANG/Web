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
const DEMO_UPDATED_AT = '2026-02-22T10:00:00.000Z';

const DEMO_SLIDE_REACTION_SUMMARY_FALLBACK: Record<ReactionType, number> = {
  fire: 0,
  sleepy: 0,
  good: 0,
  bad: 0,
  confused: 0,
};

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

export const DEMO_PRESENTATION_DETAIL: Presentation = {
  projectId: DEMO_PROJECT_ID,
  title: DEMO_PRESENTATION.title,
  status: 'completed',
  thumbnailUrl: DEMO_SLIDES[0]?.imageUrl,
  slideCount: DEMO_SLIDES.length,
  feedbackCount: DEMO_PRESENTATION.initialComments.length,
  reactionCount: DEMO_PRESENTATION.initialReactions.reduce((sum, item) => sum + item.count, 0),
  viewCount: 182,
  durationSeconds: 98,
  userName: DEMO_PRESENTATION.publisherName,
  createdAt: DEMO_CREATED_AT,
  updatedAt: DEMO_UPDATED_AT,
};

export const DEMO_VIDEO_LIST_ITEMS: VideoListItemDto[] = [
  {
    videoId: DEMO_VIDEO_ID,
    title: '또랑 데모 리허설 #1',
    status: 'ready',
    durationSeconds: 98,
    thumbnailUrl: '/thumbnails/p3/8.webp',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: DEMO_PRESENTATION.initialComments.length,
    viewCount: 63,
    reactionCount: DEMO_PRESENTATION.initialReactions.reduce((sum, item) => sum + item.count, 0),
    replyCount: 1,
    rootCommentCount: 2,
    createdAt: '2026-02-22T10:00:00.000Z',
  },
  {
    videoId: 'demo-video-2',
    title: '또랑 데모 리허설 #2 (개선본)',
    status: 'ready',
    durationSeconds: 92,
    thumbnailUrl: '/thumbnails/p3/4.webp',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: 5,
    viewCount: 41,
    reactionCount: 22,
    replyCount: 2,
    rootCommentCount: 3,
    createdAt: '2026-02-22T13:30:00.000Z',
  },
  {
    videoId: 'demo-video-3',
    title: '또랑 데모 리허설 #3 (최종)',
    status: 'ready',
    durationSeconds: 90,
    thumbnailUrl: '/thumbnails/p3/0.webp',
    hlsMasterUrl: DEMO_PRESENTATION.videoUrl,
    feedbackCount: 3,
    viewCount: 19,
    reactionCount: 9,
    replyCount: 0,
    rootCommentCount: 3,
    createdAt: '2026-02-22T16:00:00.000Z',
  },
];

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
        createdAt: '2026-02-22T10:00:00.000Z',
      },
      {
        versionNumber: 1,
        scriptText: `${slide.script}\n\n(초안)`,
        charCount: `${slide.script}\n\n(초안)`.length,
        createdAt: '2026-02-21T09:00:00.000Z',
      },
    ],
  ]),
);

export const DEMO_SLIDE_COMMENTS_BY_SLIDE_ID: Record<string, Comment[]> = {
  '101': [
    {
      commentId: 'demo-slide-comment-101-1',
      userId: 'demo-user-1',
      userName: '민지',
      content: '문제 정의가 명확해서 시작 흐름이 좋아요.',
      createdAt: '2026-02-22T10:02:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 0 },
    },
  ],
  '102': [
    {
      commentId: 'demo-slide-comment-102-1',
      userId: 'demo-user-2',
      userName: '지훈',
      content: '기존 방식 대비 차이를 한 문장 더 보강하면 좋겠습니다.',
      createdAt: '2026-02-22T10:04:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 1 },
    },
    {
      commentId: 'demo-slide-comment-102-1-reply',
      parentId: 'demo-slide-comment-102-1',
      isReply: true,
      userId: 'demo-user-3',
      userName: '소연',
      content: '개선 전/후 예시도 같이 넣으면 더 설득될 것 같아요.',
      createdAt: '2026-02-22T10:05:00.000Z',
      isMine: false,
    },
  ],
  '103': [
    {
      commentId: 'demo-slide-comment-103-1',
      userId: 'demo-user-4',
      userName: '태훈',
      content: '결론에서 다음 액션이 명확해서 마무리가 좋습니다.',
      createdAt: '2026-02-22T10:07:00.000Z',
      isMine: false,
      ref: { kind: 'slide', index: 2 },
    },
  ],
};

export const DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID: Record<
  string,
  Record<ReactionType, number>
> = {
  '101': {
    fire: 5,
    sleepy: 0,
    good: 11,
    bad: 0,
    confused: 1,
  },
  '102': {
    fire: 4,
    sleepy: 1,
    good: 9,
    bad: 0,
    confused: 3,
  },
  '103': {
    fire: 6,
    sleepy: 0,
    good: 13,
    bad: 0,
    confused: 1,
  },
};

export function getDemoSlideReactionSummary(slideId: string): Record<ReactionType, number> {
  return DEMO_SLIDE_REACTION_SUMMARY_BY_SLIDE_ID[slideId] ?? DEMO_SLIDE_REACTION_SUMMARY_FALLBACK;
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
    (sum, value) => sum + Object.values(value).reduce((acc, count) => acc + count, 0),
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
  videoIds: [DEMO_VIDEO_ID],
  totalViews: 182,
  avgDurationSeconds: 74,
  completionRate: 0.71,
  totalFeedbackCount: 36,
};

export const DEMO_SLIDE_ANALYTICS: ReadSlideAnalyticsResponseDto = {
  slides: [
    {
      slideId: '101',
      slideNum: 1,
      title: '문제 정의',
      viewCount: 182,
      exitCount: 18,
      exitRate: 0.1,
      reactionCount: 17,
      commentCount: 6,
      feedbackCount: 23,
    },
    {
      slideId: '102',
      slideNum: 2,
      title: '해결 방법',
      viewCount: 164,
      exitCount: 31,
      exitRate: 0.19,
      reactionCount: 17,
      commentCount: 9,
      feedbackCount: 26,
    },
    {
      slideId: '103',
      slideNum: 3,
      title: '기대 효과',
      viewCount: 133,
      exitCount: 22,
      exitRate: 0.16,
      reactionCount: 20,
      commentCount: 4,
      feedbackCount: 24,
    },
  ],
};

export const DEMO_VIDEO_EXIT_ANALYTICS: ReadVideoExitAnalyticsResponseDto = {
  exits: [
    { timestampMs: 12000, exitCount: 6, exitRate: 0.03 },
    { timestampMs: 47000, exitCount: 14, exitRate: 0.08 },
    { timestampMs: 78000, exitCount: 10, exitRate: 0.06 },
  ],
};

export const DEMO_SLIDE_RETENTION: ReadSlideRetentionResponseDto = {
  totalSessions: 182,
  slideRetention: [
    { slideId: '101', slideNum: 1, title: '문제 정의', sessionCount: 182, retentionRate: 1 },
    { slideId: '102', slideNum: 2, title: '해결 방법', sessionCount: 154, retentionRate: 0.85 },
    { slideId: '103', slideNum: 3, title: '기대 효과', sessionCount: 129, retentionRate: 0.71 },
  ],
};

export const DEMO_VIDEO_RETENTION: ReadVideoRetentionResponseDto = {
  totalSessions: 182,
  durationSeconds: 98,
  intervalMs: 10000,
  videoRetention: [
    { timestampMs: 0, sessionCount: 182, retentionRate: 1 },
    { timestampMs: 10000, sessionCount: 176, retentionRate: 0.97 },
    { timestampMs: 20000, sessionCount: 168, retentionRate: 0.92 },
    { timestampMs: 30000, sessionCount: 159, retentionRate: 0.87 },
    { timestampMs: 40000, sessionCount: 149, retentionRate: 0.82 },
    { timestampMs: 50000, sessionCount: 139, retentionRate: 0.76 },
    { timestampMs: 60000, sessionCount: 128, retentionRate: 0.7 },
    { timestampMs: 70000, sessionCount: 118, retentionRate: 0.65 },
    { timestampMs: 80000, sessionCount: 109, retentionRate: 0.6 },
    { timestampMs: 90000, sessionCount: 97, retentionRate: 0.53 },
  ],
};

export const DEMO_RECENT_COMMENTS: ReadRecentCommentListResponseDto = {
  comments: [
    {
      commentId: 'demo-recent-1',
      content: '해결 방법 슬라이드에서 비교 포인트가 잘 보입니다.',
      timestampMs: 43000,
      createdAt: '2026-02-22T10:03:00.000Z',
      user: {
        userId: 'demo-user-2',
        nickName: '지훈',
        name: '지훈',
        profileImageUrl: null,
      },
      slide: {
        slideId: '102',
        slideNum: 2,
        title: '해결 방법',
        imageUrl: '/thumbnails/p3/4.webp',
      },
    },
    {
      commentId: 'demo-recent-2',
      content: '결론에서 다음 액션이 명확하게 정리되어 좋습니다.',
      timestampMs: 76000,
      createdAt: '2026-02-22T10:07:00.000Z',
      user: {
        userId: 'demo-user-4',
        nickName: '태훈',
        name: '태훈',
        profileImageUrl: null,
      },
      slide: {
        slideId: '103',
        slideNum: 3,
        title: '기대 효과',
        imageUrl: '/thumbnails/p3/8.webp',
      },
    },
    {
      commentId: 'demo-recent-3',
      content: '문제 정의에서 실제 사례 한 줄 추가하면 더 좋아요.',
      timestampMs: 11000,
      createdAt: '2026-02-22T10:01:00.000Z',
      user: {
        userId: 'demo-user-1',
        nickName: '민지',
        name: '민지',
        profileImageUrl: null,
      },
      slide: {
        slideId: '101',
        slideNum: 1,
        title: '문제 정의',
        imageUrl: '/thumbnails/p3/0.webp',
      },
    },
  ],
};
