import type { Slide } from '@/types/slide';

import { MOCK_USERS } from './users';
import { timeAgo, timeAt } from './utils';

/**
 * 임시 슬라이드 데이터
 * - 추후 서버에서 받아온 데이터로 대체
 *
 * 타임스탬프는 ISO 8601 형식을 사용하며,
 * UI 레이어에서 상대 시간(dayjs.fromNow) 또는 절대 시간(dayjs.format)으로 변환합니다.
 */

// 프로젝트별 슬라이드 개수 정의
const PROJECT_SLIDE_COUNTS = {
  p1: 70,
  p2: 59,
  p3: 17,
  p4: 28,
};

// 기본 슬라이드 생성 함수
const createDefaultSlide = (projectId: string, index: number): Slide => ({
  id: `${projectId}-${index}`,
  projectId,
  title: `슬라이드 ${index + 1}`,
  thumb: `/thumbnails/${projectId}/${index}.webp`,
  script: `${projectId} 프로젝트의 슬라이드 ${index + 1}번 내용입니다.`,
  opinions: [],
  history: [],
  emojiReactions: [],
  startTime: index * 60, // 슬라이드당 60초 간격
});

const p1Slides: Slide[] = [
  {
    id: 'p1-0',
    projectId: 'p1',
    title: '도입',
    thumb: '/thumbnails/p1/0.webp',
    startTime: 12,
    script: `안녕하세요, 세션에 참석해주셔서 감사합니다.
네이버 지도 리브랜딩 진행한 최은혜, 원종원이고요.
다음 주 월요일에 네이버지도 서비스 개편과 함께 리브랜딩된 모습이 공개될 예정입니다.
많은 관심 부탁드리고 지금부터 네이버 지도 리브랜딩 과정 소개해 드리도록 하겠습니다.
    `,
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[1].id,
        content: '도입부가 인상적이에요!',
        createdAt: timeAgo(2, 'minute'),
        isMine: false,
      },
      {
        id: '2',
        userId: MOCK_USERS[0].id,
        content: '감사합니다~',
        createdAt: timeAgo(1, 'minute'),
        isMine: true,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        userId: MOCK_USERS[2].id,
        content: '첫 문장을 질문으로 시작하면 어떨까요?',
        createdAt: timeAgo(30, 'second'),
        isMine: false,
      },
    ],
    history: [
      {
        versionNumber: 1,
        scriptText: '안녕하세요.',
        charCount: 6,
        createdAt: timeAt(1, 14, 0),
      },
      {
        versionNumber: 2,
        scriptText: '안녕하세요, 오늘 발표를 맡은 김또랑입니다.',
        charCount: 24,
        createdAt: timeAt(1, 14, 30),
      },
    ],
    emojiReactions: [
      { type: 'fire', count: 8 },
      { type: 'sleepy', count: 4 },
      { type: 'good', count: 99, active: true },
      { type: 'bad', count: 1 },
      { type: 'confused', count: 13 },
    ],
  },

  {
    id: 'p1-1',
    projectId: 'p1',
    title: '문제 정의',
    thumb: '/thumbnails/p1/1.webp',
    startTime: 37,
    script: '',
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[1].id,
        content: '문제 정의가 명확하네요',
        createdAt: timeAgo(10, 'minute'),
        isMine: false,
      },
      {
        id: '2',
        userId: MOCK_USERS[2].id,
        content: '동의합니다!',
        createdAt: timeAgo(9, 'minute'),
        isMine: false,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        userId: MOCK_USERS[3].id,
        content: '추가로 이런 문제도 있어요',
        createdAt: timeAgo(8, 'minute'),
        isMine: false,
      },
      {
        id: '4',
        userId: MOCK_USERS[0].id,
        content: '좋은 의견이에요',
        createdAt: timeAgo(7, 'minute'),
        isMine: true,
        isReply: true,
        parentId: '3',
      },
      {
        id: '5',
        userId: MOCK_USERS[4].id,
        content: '사용자 인터뷰 결과도 추가하면 좋겠어요',
        createdAt: timeAgo(6, 'minute'),
        isMine: false,
      },
      {
        id: '6',
        userId: MOCK_USERS[1].id,
        content: '데이터로 뒷받침하면 더 설득력 있을 것 같아요',
        createdAt: timeAgo(5, 'minute'),
        isMine: false,
      },
      {
        id: '7',
        userId: MOCK_USERS[2].id,
        content: '경쟁사 분석도 넣어보는 건 어떨까요?',
        createdAt: timeAgo(4, 'minute'),
        isMine: false,
      },
      {
        id: '8',
        userId: MOCK_USERS[0].id,
        content: '네, 반영해볼게요!',
        createdAt: timeAgo(3, 'minute'),
        isMine: true,
        isReply: true,
        parentId: '7',
      },
    ],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 8 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-2',
    projectId: 'p1',
    title: '문제 분석',
    thumb: '/thumbnails/p1/2.webp',
    startTime: 38,
    script: `먼저 네이버 지도 리브랜딩이 어떻게 시작되었는지 설명드리고자 하는데요.
일반적으로 리브랜딩은 사업부서의 요청에 따라 추진되는 경우가 많은데,
이번 프로젝트는 브랜드 조직에서 서비스 현황과 브랜드 이미지를 진단해서
지도 서비스 래브랜딩 필요성을 주도적으로 검토하였고요.
이후 사업부서와의 긴밀한 논의와 공감대 형성을 거쳐서 리브랜딩 프로젝트를 진행했습니다.
    `,
    opinions: [],
    history: [
      {
        versionNumber: 1,
        scriptText: '문제 분석 초안입니다.',
        charCount: 12,
        createdAt: timeAt(3, 18, 0),
      },
      {
        versionNumber: 2,
        scriptText: '문제의 원인을 분석해보겠습니다.',
        charCount: 17,
        createdAt: timeAt(2, 9, 30),
      },
      {
        versionNumber: 3,
        scriptText: '문제의 근본 원인은 세 가지로 분류할 수 있습니다.',
        charCount: 26,
        createdAt: timeAt(2, 9, 45),
      },
      {
        versionNumber: 4,
        scriptText: '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.',
        charCount: 41,
        createdAt: timeAt(2, 10, 0),
      },
      {
        versionNumber: 5,
        scriptText:
          '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.\n둘째, 구조적 문제입니다.',
        charCount: 56,
        createdAt: timeAt(2, 10, 15),
      },
      {
        versionNumber: 6,
        scriptText:
          '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.\n둘째, 구조적 문제입니다.\n셋째, 사용 흐름의 복잡성입니다.',
        charCount: 76,
        createdAt: timeAt(2, 10, 30),
      },
    ],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 3 },
    ],
  },

  {
    id: 'p1-3',
    projectId: 'p1',
    title: '해결 목표',
    thumb: '/thumbnails/p1/3.webp',
    startTime: 66,
    script: '그럼 왜 네이버 지도 서비스였을까 궁금하실 텐데요.',
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[3].id,
        content: '목표가 명확해요!',
        createdAt: timeAgo(1, 'hour'),
        isMine: false,
      },
    ],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 12 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 8 },
      { type: 'bad', count: 2 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-4',
    projectId: 'p1',
    title: '해결 방안',
    thumb: '/thumbnails/p1/4.webp',
    startTime: 71,
    script: `네이버 지도를 떠올리면 대부분 장소 검색이나 길 찾기, 이동 기능을 먼저 생각하실 것 같아요.
하지만 올해 중순에 새롭게 추가된 발견 탭을 통해서 네이버 지도 서비스가 변화하고 있다는 흐름을 감지할 수 있었습니다.

사용자는 발견 탭을 통해서 자신의 취향에 맞는 장소를 추천받고 새로운 장소를 발견할 수 있는데요.
이러한 점을 미루어봤을 때 네이버 지도의 역할이 점차 확장되고 있다는 인상을 받았습니다.
    `,
    opinions: [],
    history: [
      {
        versionNumber: 1,
        scriptText: '핵심 해결 방안은 다음과 같습니다.',
        charCount: 17,
        createdAt: timeAt(2, 11, 0),
      },
    ],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 150 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-5',
    projectId: 'p1',
    title: '기능 구성 및 상세 설계 - 핵심 모듈 분석',
    thumb: '/thumbnails/p1/5.webp',
    startTime: 105,
    script: `최근 2, 3년간 보도 자료를 통해서도 네이버 지도 서비스의 방향과 전략이 변화하고 있음을 알 수 있었는데요.
왼쪽 모빌리티 영역에서는 VR, 3D 맵, 글로벌 타겟 확장 등 기술적 고도화를 꾸준히 이어가고 있었고,
또 오른쪽을 보시면 장소를 기반으로 온오프라인 경험을 유기적으로 연결하는 플랫폼으로 진화하고 있었습니다.

그래서 네이버 지도는 단순한 길 찾기 앱을 넘어 사용자의 온오프라인 장소 경험을 연결하고, 확장하고 지원하는 생활 밀착형 플랫폼,
나아가 슈퍼 앱을 목표로 하는 만큼 플랫폼적 역할까지 강화하고 있음을 확인할 수 있었는데요.
    `,
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[4].id,
        content: '기능 정의가 잘 되어있네요',
        createdAt: timeAgo(2, 'hour'),
        isMine: false,
      },
    ],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 5 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-6',
    projectId: 'p1',
    title: '화면 흐름',
    thumb: '/thumbnails/p1/6.webp',
    startTime: 150,
    script: `곧 공개될 서비스 개편에서도 네이버 지도의 확장 방향성을 확인할 수 있었습니다.
앞서 말씀드린 발견 피드뿐 아니라 예약과 저장 기능이 전면 탭에 등장하면서 네이버 지도는 이제 모빌리티뿐 아니라
장소 기반, 컨텐츠 전반을 아우르는 통합 플랫폼으로 진화하고 있음을 확인할 수 있었습니다.
    `,
    opinions: [],
    history: [
      {
        versionNumber: 1,
        scriptText: '사용자 화면 흐름 초안',
        charCount: 11,
        createdAt: timeAt(2, 15, 0),
      },
    ],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-7',
    projectId: 'p1',
    title: '기술적 구현',
    thumb: '/thumbnails/p1/7.webp',
    startTime: 174,
    script: `그래서 저희는 지금 네이버 지도 서비스 방향성이 전환되고 확장되는 매우 중요한 모멘텀이라고 판단했고요.
네이버 지도의 미래 방향성과 서비스 철학을 담아낼 새로운 브랜드 아이덴티티가 필요하다고 보았습니다.
    `,
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[0].id,
        content: 'Zustand로 상태 관리하면 좋을 것 같아요',
        createdAt: timeAgo(3, 'hour'),
        isMine: true,
      },
      {
        id: '2',
        userId: MOCK_USERS[0].id,
        content: 'Context보다 성능이 좋습니다',
        createdAt: timeAgo(2, 'hour'),
        isMine: true,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        userId: MOCK_USERS[0].id,
        content: 'Selector 패턴으로 최적화 가능해요',
        createdAt: timeAgo(1, 'hour'),
        isMine: true,
      },
    ],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 2 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-8',
    projectId: 'p1',
    title: '기대 효과',
    thumb: '/thumbnails/p1/8.webp',
    startTime: 192,
    script: `그렇다면 현재 브랜드 아이덴티티는 어떠한지 점검해보았는데요.
점차 진화하고 있는 서비스 방향에 비해서 현재 브랜드 아이덴티티는 이전의 네이버 지도 이미지에 머물러있다는 인상을 받았습니다.

길, 이동, 모빌리티가 강조된 앱 아이콘, 그리고 큰 차별점이 없는 브랜드 메시지, 그리고 브랜드 색상과 그래픽 에셋 역시
전략 아래 운영되기보다는 캠페인 별, 기능 별로 개별적으로 사용되고 있어 일관성이 부족한 상황이었습니다.
    `,
    opinions: [
      {
        id: '1',
        userId: MOCK_USERS[1].id,
        content: '기대 효과가 구체적이에요',
        createdAt: timeAgo(4, 'hour'),
        isMine: false,
      },
      {
        id: '2',
        userId: MOCK_USERS[2].id,
        content: '수치화된 목표가 있으면 더 좋겠어요',
        createdAt: timeAgo(3, 'hour'),
        isMine: false,
      },
      {
        id: '3',
        userId: MOCK_USERS[3].id,
        content: '비즈니스 임팩트도 추가해주세요',
        createdAt: timeAgo(2, 'hour'),
        isMine: false,
      },
    ],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 7 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 3 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-9',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/9.webp',
    startTime: 227,
    script: `광고 캠페인 측면에서도 지난해 외국인 관광객 대상 바이럴 필름을 제외하고는
네이버 지도의 변화를 알리는 캠페인이 적극적으로 진행되지 않았기 때문에,
브랜드 조직에서는 이번 리브랜딩을 통해서 네이버 지도의 미래 방향성을 담은 브랜드 메시지, 디자인 그리고
캠페인까지, 전반적으로 브랜드 재정비가 필요하다고 판단했습니다.
`,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-10',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/10.webp',
    startTime: 251,
    script: `그래서 저희는 네이버 지도 브랜드를 어떤 방향성과 언어, 디자인으로 사용자를 설득할 수 있을지에 대해 뾰족한 나침판을 세워보기로 했는데요.
그 근거를 찾기 위해 가장 먼저 진행한 단계는 사업부서 인터뷰와 사용자 조사였습니다.
앞서 리서치를 통해 얻은 인사이트가 우리 내부만의 시각인지, 혹은 사업부서와 사용자 모두가 공감하는 문제인지 확인이 필요했는데요.
`,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-11',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/11.webp',
    startTime: 282,
    script: `사업부서 13분과의 심층 인터뷰를 통해서 네이버 지도는 어떤 서비스라고 생각하는지, 앞으로 서비스가 어떤 방향으로 나아가야 한다고 생각하는지
그리고 브랜드 아이덴티티 측면에서도 어떤 부분이 부족하고 보안이 필요한지 인터뷰를 진행했습니다.
`,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-12',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/12.webp',
    startTime: 302,
    script: `많은 분들이 공통적으로 네이버 지도는 온오프라인을 연결해 주는 서비스, 장소 경험이 완결되고 확장되는 서비스라고 말씀 주셨습니다.
하지만 그에 비해 브랜드 아이덴티티는 이러한 서비스의 가치와 방향성을 충분히 담아내지 못하고 있다는 의견이 공통적으로 있었고요.
    `,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-13',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/13.webp',
    startTime: 323,
    script: `사용자 조사에서도 네이버 지도를 떠올렸을 때 연상되는 이미지, 사용성, 만족도, 아쉬운 점이나 개선되었으면 하는 점에 대해서 질문을 드렸고
사용성, 서비스 만족도 면에서는 높은 평가를 받았지만, 그에 비해 브랜드로서의 인상이나 고요한 이미지는 뚜렷하지 않다는 점이 드러났습니다.
    `,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-14',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/14.webp',
    startTime: 347,
    script: `그 결과 리서치를 통해 얻었던 인사이트와 내부, 외부의 시선이 일치하다는 것을 확인할 수 있었는데요.
서비스 방향성으로는 네이버 지도가 장소와 관련된 모든 경험을 제공하고 연결하는 올인원 플랫폼으로 나아가고 있다는 점,
브랜드 측면에서는 이러한 서비스의 변화를 사용자에게 명확하게 전달할 수 있는 새로운 브랜드 아이덴티티가 필요하다는 공감대가 형성되었습니다.
    `,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },

  {
    id: 'p1-15',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/p1/15.webp',
    startTime: 444,
    script: ``,
    opinions: [],
    history: [],
    emojiReactions: [
      { type: 'fire', count: 0 },
      { type: 'sleepy', count: 0 },
      { type: 'good', count: 0 },
      { type: 'bad', count: 0 },
      { type: 'confused', count: 0 },
    ],
  },
];

// 나머지 프로젝트 및 p1의 나머지 슬라이드 생성
const generatedSlides = Object.entries(PROJECT_SLIDE_COUNTS).flatMap(([projectId, count]) => {
  // p1Slides에 p1-0 ~ p1-15 (16개)가 이미 정의되어 있음
  const startIdx = projectId === 'p1' ? p1Slides.length : 0;
  return Array.from({ length: count - startIdx }).map((_, i) =>
    createDefaultSlide(projectId, i + startIdx),
  );
});

export const MOCK_SLIDES: Slide[] = [...p1Slides, ...generatedSlides];
