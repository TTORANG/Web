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
export const MOCK_SLIDES: Slide[] = [
  // 1. 풀 데이터 - 의견+답글+이모지+대본+히스토리
  {
    id: '1',
    projectId: 'p1',
    title: '도입',
    thumb: '/thumbnails/slide-0.webp',
    script:
      '안녕하세요, 오늘 발표를 맡은 김또랑입니다.\n이번 프로젝트는 프레젠테이션 협업 도구입니다.',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[1].id,
        content: '도입부가 인상적이에요!',
        timestamp: timeAgo(2, 'minute'),
        isMine: false,
      },
      {
        id: '2',
        authorId: MOCK_USERS[0].id,
        content: '감사합니다~',
        timestamp: timeAgo(1, 'minute'),
        isMine: true,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        authorId: MOCK_USERS[2].id,
        content: '첫 문장을 질문으로 시작하면 어떨까요?',
        timestamp: timeAgo(30, 'second'),
        isMine: false,
      },
    ],
    history: [
      {
        id: 'h1',
        timestamp: timeAt(1, 14, 30),
        content: '안녕하세요, 오늘 발표를 맡은 김또랑입니다.',
      },
      {
        id: 'h2',
        timestamp: timeAt(1, 14, 0),
        content: '안녕하세요.',
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

  // 2. 의견 많음 - 스크롤 테스트
  {
    id: '2',
    projectId: 'p1',
    title: '문제 정의',
    thumb: '/thumbnails/slide-1.webp',
    script: '',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[1].id,
        content: '문제 정의가 명확하네요',
        timestamp: timeAgo(10, 'minute'),
        isMine: false,
      },
      {
        id: '2',
        authorId: MOCK_USERS[2].id,
        content: '동의합니다!',
        timestamp: timeAgo(9, 'minute'),
        isMine: false,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        authorId: MOCK_USERS[3].id,
        content: '추가로 이런 문제도 있어요',
        timestamp: timeAgo(8, 'minute'),
        isMine: false,
      },
      {
        id: '4',
        authorId: MOCK_USERS[0].id,
        content: '좋은 의견이에요',
        timestamp: timeAgo(7, 'minute'),
        isMine: true,
        isReply: true,
        parentId: '3',
      },
      {
        id: '5',
        authorId: MOCK_USERS[4].id,
        content: '사용자 인터뷰 결과도 추가하면 좋겠어요',
        timestamp: timeAgo(6, 'minute'),
        isMine: false,
      },
      {
        id: '6',
        authorId: MOCK_USERS[1].id,
        content: '데이터로 뒷받침하면 더 설득력 있을 것 같아요',
        timestamp: timeAgo(5, 'minute'),
        isMine: false,
      },
      {
        id: '7',
        authorId: MOCK_USERS[2].id,
        content: '경쟁사 분석도 넣어보는 건 어떨까요?',
        timestamp: timeAgo(4, 'minute'),
        isMine: false,
      },
      {
        id: '8',
        authorId: MOCK_USERS[0].id,
        content: '네, 반영해볼게요!',
        timestamp: timeAgo(3, 'minute'),
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

  // 3. 히스토리 많음 - 스크롤 테스트
  {
    id: '3',
    projectId: 'p1',
    title: '문제 분석',
    thumb: '/thumbnails/slide-2.webp',
    script:
      '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.\n둘째, 구조적 문제입니다.\n셋째, 사용 흐름의 복잡성입니다.',
    opinions: [],
    history: [
      {
        id: 'h1',
        timestamp: timeAt(2, 10, 30),
        content:
          '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.\n둘째, 구조적 문제입니다.\n셋째, 사용 흐름의 복잡성입니다.',
      },
      {
        id: 'h2',
        timestamp: timeAt(2, 10, 15),
        content:
          '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.\n둘째, 구조적 문제입니다.',
      },
      {
        id: 'h3',
        timestamp: timeAt(2, 10, 0),
        content: '문제의 근본 원인은 세 가지로 분류할 수 있습니다.\n첫째, 기능적 한계입니다.',
      },
      {
        id: 'h4',
        timestamp: timeAt(2, 9, 45),
        content: '문제의 근본 원인은 세 가지로 분류할 수 있습니다.',
      },
      {
        id: 'h5',
        timestamp: timeAt(2, 9, 30),
        content: '문제의 원인을 분석해보겠습니다.',
      },
      {
        id: 'h6',
        timestamp: timeAt(3, 18, 0),
        content: '문제 분석 초안입니다.',
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

  // 4. 이모지 많음 - 더보기 팝오버 테스트
  {
    id: '4',
    projectId: 'p1',
    title: '해결 목표',
    thumb: '/thumbnails/slide-3.webp',
    script: '',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[3].id,
        content: '목표가 명확해요!',
        timestamp: timeAgo(1, 'hour'),
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

  // 5. 이모지 99+ - 카운트 표시 테스트
  {
    id: '5',
    projectId: 'p1',
    title: '해결 방안',
    thumb: '/thumbnails/slide-4.webp',
    script: '핵심 해결 방안은 다음과 같습니다.',
    opinions: [],
    history: [
      {
        id: 'h1',
        timestamp: timeAt(2, 11, 0),
        content: '핵심 해결 방안은 다음과 같습니다.',
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

  // 6. 긴 제목 - truncate 테스트
  {
    id: '6',
    projectId: 'p1',
    title: '기능 구성 및 상세 설계 - 핵심 모듈 분석',
    thumb: '/thumbnails/slide-5.webp',
    script: '',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[4].id,
        content: '기능 정의가 잘 되어있네요',
        timestamp: timeAgo(2, 'hour'),
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

  // 7. 긴 대본 - 스크롤 테스트
  {
    id: '7',
    projectId: 'p1',
    title: '화면 흐름',
    thumb: '/thumbnails/slide-6.webp',
    script: `사용자 화면 흐름을 설명드리겠습니다.

1. 로그인 화면
사용자는 먼저 로그인 화면에서 소셜 로그인을 통해 접속합니다.
Google, Kakao, Naver 로그인을 지원합니다.

2. 프로젝트 목록
로그인 후 자신이 참여한 프로젝트 목록을 확인할 수 있습니다.
최근 수정된 순서로 정렬되어 있습니다.

3. 슬라이드 편집
프로젝트를 선택하면 슬라이드 편집 화면으로 이동합니다.
좌측에는 썸네일 목록, 우측에는 슬라이드 뷰어가 있습니다.
하단의 스크립트 박스에서 대본을 작성할 수 있습니다.

4. 협업 기능
팀원들은 의견을 남기고 이모지로 반응할 수 있습니다.
변경 기록을 통해 이전 버전으로 복원할 수 있습니다.

5. 발표 모드
완성된 프레젠테이션은 발표 모드로 진행할 수 있습니다.`,
    opinions: [],
    history: [
      {
        id: 'h1',
        timestamp: timeAt(2, 15, 0),
        content: '사용자 화면 흐름 초안',
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

  // 8. 내 의견만 - 삭제 버튼 테스트
  {
    id: '8',
    projectId: 'p1',
    title: '기술적 구현',
    thumb: '/thumbnails/slide-7.webp',
    script: 'React 19, TypeScript, Zustand를 사용합니다.',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[0].id,
        content: 'Zustand로 상태 관리하면 좋을 것 같아요',
        timestamp: timeAgo(3, 'hour'),
        isMine: true,
      },
      {
        id: '2',
        authorId: MOCK_USERS[0].id,
        content: 'Context보다 성능이 좋습니다',
        timestamp: timeAgo(2, 'hour'),
        isMine: true,
        isReply: true,
        parentId: '1',
      },
      {
        id: '3',
        authorId: MOCK_USERS[0].id,
        content: 'Selector 패턴으로 최적화 가능해요',
        timestamp: timeAgo(1, 'hour'),
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

  // 9. 타인 의견만 - 답글 테스트
  {
    id: '9',
    projectId: 'p1',
    title: '기대 효과',
    thumb: '/thumbnails/slide-8.webp',
    script: '',
    opinions: [
      {
        id: '1',
        authorId: MOCK_USERS[1].id,
        content: '기대 효과가 구체적이에요',
        timestamp: timeAgo(4, 'hour'),
        isMine: false,
      },
      {
        id: '2',
        authorId: MOCK_USERS[2].id,
        content: '수치화된 목표가 있으면 더 좋겠어요',
        timestamp: timeAgo(3, 'hour'),
        isMine: false,
      },
      {
        id: '3',
        authorId: MOCK_USERS[3].id,
        content: '비즈니스 임팩트도 추가해주세요',
        timestamp: timeAgo(2, 'hour'),
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

  // 10. 빈 데이터 - empty state 테스트
  {
    id: '10',
    projectId: 'p1',
    title: '결론',
    thumb: '/thumbnails/slide-9.webp',
    script: '',
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
