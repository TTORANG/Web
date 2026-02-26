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
  title: '또랑 발표 피드백 데모',
  publisherName: '정제훈 · 로로',
  postedAtLabel: '2026.02.26',
  shareMessage: '또랑 데모 발표를 확인하고 피드백을 남겨주세요.',
  videoUrl: '/demo-webcam.mp4',
  slides: [
    {
      slideId: '101',
      projectId: 'demo',
      title: '또랑 소개',
      summary: '서비스 한 줄 정의와 발표 시작 맥락을 전달합니다.',
      slideNum: 1,
      imageUrl: '/thumbnails/p1/0.jpg',
      script:
        '안녕하세요. 세상에서 가장 쉽고 빠른 발표 피드백, 또랑을 소개할 PM 로로/정제훈입니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 0,
    },
    {
      slideId: '102',
      projectId: 'demo',
      title: '이상과 현실',
      summary: '잘하고 싶은 발표와 실제 발표 경험의 간극을 보여줍니다.',
      slideNum: 2,
      imageUrl: '/thumbnails/p1/1.jpg',
      script:
        '우리는 모두 스티브잡스처럼 이해하기 쉽고 재미있는 발표를 잘하고 싶어합니다. 하지만 현실에서는 준비 시간이 부족해 쉽게 지치고, 발표 퀄리티가 들쭉날쭉해집니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 18,
    },
    {
      slideId: '103',
      projectId: 'demo',
      title: '기존 방식의 문제점',
      summary: '피드백 요청 과정에서 반복되는 세 가지 문제를 제시합니다.',
      slideNum: 3,
      imageUrl: '/thumbnails/p1/2.jpg',
      script: `그럼 어떻게하면 발표를 잘할 수 있을까요?
열심히 연습하고, 다른 사람한테 피드백을 받아야 합니다.
그런데 대면으로 요청하자니 일정 조율해야 하고,
친구에게 부탁하면 그냥 괜찮네, 좋다, 정도밖에 듣지 못하죠.
주변 멘토님께 부탁해도 첨부파일이 누락되거나, 수정할 때마다 다시 보내야 합니다.
`,
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 37,
    },
    {
      slideId: '104',
      projectId: 'demo',
      title: 'Goal',
      summary: '또랑이 해결하려는 핵심 가치와 방향을 한 문장으로 강조합니다.',
      slideNum: 4,
      imageUrl: '/thumbnails/p1/3.jpg',
      script: '그래서 또랑은 이 모든 마찰을 없애는 Frictionless한 피드백 경험을 제안합니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 55,
    },
    {
      slideId: '105',
      projectId: 'demo',
      title: '핵심 기능 3가지',
      summary: '간편한 공유, 솔직한 피드백, 직관적 데이터의 구조를 설명합니다.',
      slideNum: 5,
      imageUrl: '/thumbnails/p1/4.jpg',
      script: `또랑은 자료, 대본, 영상을 링크 하나로 간편하게 공유할 수 있습니다.
이 링크를 받은 사람은 익명으로, 지루해요, 잘했어요 같은 이모지 반응을 남길 수 있습니다.
발표자는 피드백자가 어디서 이탈했는지, 어느 슬라이드에서 반응을 많이 했는지 등 직관적인 데이터를 확인할 수 있어요.
`,
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 74,
    },
    {
      slideId: '106',
      projectId: 'demo',
      title: '타깃 페르소나',
      summary: 'IR 피칭 준비자와 PT 면접 준비자를 주요 사용자로 정의합니다.',
      slideNum: 6,
      imageUrl: '/thumbnails/p1/5.jpg',
      script:
        '플로우는 간단합니다. PDF나 PPTX를 업로드하고, 링크를 카카오톡·인스타·X로 공유하면, 피드백자가 모바일에서 바로 이모지와 댓글을 남길 수 있습니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 93,
    },
    {
      slideId: '107',
      projectId: 'demo',
      title: '사용 플로우',
      summary: '업로드부터 공유, 피드백 수집까지의 흐름을 한 번에 보여줍니다.',
      slideNum: 7,
      imageUrl: '/thumbnails/p1/6.jpg',
      script:
        '주요 사용자는 Seed/Pre-A 단계 스타트업 대표와 PT 면접 준비자입니다. 두 그룹 모두 짧은 시간 안에 설득력 있는 발표를 만들어야 하고, 빠르고 구체적인 피드백이 절실합니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 113,
    },
    {
      slideId: '108',
      projectId: 'demo',
      title: '메뉴 구조 설계',
      summary: '발표자/피드백자 기준으로 데스크톱과 모바일의 화면 구조를 설명합니다.',
      slideNum: 8,
      imageUrl: '/thumbnails/p1/7.jpg',
      script:
        '또랑은 즉시 사용 가능한 편리함과 객관적인 정량 데이터 제공을 동시에 만족시키는 위치를 가져갑니다. 가장 쉽고 빠르게, 그리고 가장 확실한 데이터로 발표 개선을 돕는 것이 목표입니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 135,
    },
    {
      slideId: '109',
      projectId: 'demo',
      title: '포지셔닝',
      summary: '편리함과 정량 데이터 축에서 또랑의 차별점을 정리합니다.',
      slideNum: 9,
      imageUrl: '/thumbnails/p1/8.jpg',
      script:
        '발표자는 홈·슬라이드·영상·인사이트·공유 방법 메뉴를 사용하고, 피드백자는 데스크톱과 모바일 모두에서 슬라이드 피드백과 영상 피드백에 바로 접근할 수 있게 설계했습니다.',
      createdAt: DEMO_CREATED_AT,
      updatedAt: DEMO_CREATED_AT,
      startTime: 158,
    },
  ],
  initialComments: [
    {
      commentId: 'demo-comment-1',
      userId: 'demo-user-1',
      userName: '차분한 수달',
      content: '오프닝 멘트가 간결해서 바로 집중됐어요.',
      createdAt: '2026-02-22T10:00:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 14 },
    },
    {
      commentId: 'demo-comment-2',
      userId: 'demo-user-2',
      userName: '예리한 매',
      content: '기존 방식의 불편 사례를 한 줄 더 넣으면 공감이 더 커질 것 같아요.',
      createdAt: '2026-02-22T10:03:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 67 },
    },
    {
      commentId: 'demo-comment-2-reply-1',
      parentId: 'demo-comment-2',
      isReply: true,
      userId: 'demo-user-3',
      userName: '꼼꼼한 다람쥐',
      content: '맞아요. 개선 전/후 캡처를 같이 보여주면 설득력이 더 올라가요.',
      createdAt: '2026-02-22T10:05:00.000Z',
      isMine: false,
    },
    {
      commentId: 'demo-comment-3',
      userId: 'demo-user-4',
      userName: '단호한 호랑이',
      content: '이탈 데이터 설명 파트가 인상적이에요. 실제 숫자 예시도 좋아요.',
      createdAt: '2026-02-22T10:07:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 124 },
    },
    {
      commentId: 'demo-comment-4',
      userId: 'demo-user-5',
      userName: '느긋한 고양이',
      content: '마지막 사용 방법에서 업로드 소요 시간도 알려주면 더 좋겠습니다.',
      createdAt: '2026-02-22T10:09:00.000Z',
      isMine: false,
      ref: { kind: 'video', seconds: 168 },
    },
  ],
  initialReactions: [
    { type: 'fire', count: 38 },
    { type: 'sleepy', count: 17 },
    { type: 'good', count: 62 },
    { type: 'bad', count: 21 },
    { type: 'confused', count: 14 },
  ],
};
