import type { Comment } from '@/types/comment';
import type { Reaction } from '@/types/script';
import type { SlideListItem } from '@/types/slide';

export interface DemoSlide extends SlideListItem {
  summary: string;
}

export interface DemoPresentationData {
  title: string;
  publisherName: string;
  postedAtLabel: string;
  shareMessage: string;
  videoUrl: string;
  slides: DemoSlide[];
  initialComments: Comment[];
  initialReactions: Reaction[];
}

const DEMO_CREATED_AT = '2026-02-20T09:00:00.000Z';

export const DEMO_PRESENTATION: DemoPresentationData = {
  title: '또랑 서비스 데모 발표',
  publisherName: '또랑 팀',
  postedAtLabel: '2026.02.22',
  shareMessage: '또랑 데모 발표를 확인해보세요.',
  videoUrl: '/p1.webm',
  slides: [
    {
      slideId: '101',
      projectId: 'demo',
      title: '문제 정의',
      summary: '발표 준비 과정에서 피드백 수집이 늦어지는 문제를 설명합니다.',
      slideNum: 1,
      imageUrl: '/thumbnails/p3/0.webp',
      script:
        '발표 준비는 보통 개인 작업 이후에 피드백을 받게 됩니다.\n이 과정이 늦어지면 핵심 메시지 보정 타이밍을 놓치게 됩니다.\n오늘은 그 지점을 어떻게 단축할지 공유하겠습니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 0,
    },
    {
      slideId: '102',
      projectId: 'demo',
      title: '해결 방법',
      summary: '슬라이드/영상 피드백을 한 곳에서 수집하는 워크플로우를 소개합니다.',
      slideNum: 2,
      imageUrl: '/thumbnails/p3/4.webp',
      script:
        '또랑은 슬라이드 단위로 코멘트를 남기고,\n발표 영상을 보며 시점 기반 피드백까지 함께 관리할 수 있습니다.\n팀원은 맥락이 보이는 상태에서 구체적인 개선 의견을 줄 수 있습니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 32,
    },
    {
      slideId: '103',
      projectId: 'demo',
      title: '기대 효과',
      summary: '피드백 리드타임 단축과 발표 완성도 개선 효과를 제시합니다.',
      slideNum: 3,
      imageUrl: '/thumbnails/p3/8.webp',
      script:
        '도입 전달력, 근거 밀도, 결론 임팩트를 빠르게 점검할 수 있습니다.\n결과적으로 발표 수정 사이클이 짧아지고 완성도는 높아집니다.\n다음 단계로 실전 리허설 품질이 안정적으로 올라갑니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 71,
    },
  ],
  initialComments: [
    {
      commentId: 'demo-comment-1',
      userId: 'demo-user-1',
      userName: '민지',
      content: '도입 메시지가 명확해서 초반 집중도가 높습니다.',
      createdAt: '2026-02-22T10:00:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 12 },
    },
    {
      commentId: 'demo-comment-2',
      userId: 'demo-user-2',
      userName: '지훈',
      content: '해결 방법에서 기존 방식 대비 차이를 한 줄 더 강조해보면 좋겠습니다.',
      createdAt: '2026-02-22T10:03:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 45 },
    },
    {
      commentId: 'demo-comment-2-reply-1',
      parentId: 'demo-comment-2',
      isReply: true,
      userId: 'demo-user-3',
      userName: '소연',
      content: '동의해요. 개선 전/후 예시가 같이 보이면 더 설득될 것 같아요.',
      createdAt: '2026-02-22T10:05:00.000Z',
      isMine: false,
    },
  ],
  initialReactions: [
    { type: 'fire', count: 14 },
    { type: 'sleepy', count: 2 },
    { type: 'good', count: 26 },
    { type: 'bad', count: 1 },
    { type: 'confused', count: 4 },
  ],
};
