import type { Slide } from '@/types/slide';

/**
 * 임시 슬라이드 데이터
 * - 추후 서버에서 받아온 데이터로 대체
 */
export const MOCK_SLIDES: Slide[] = [
  {
    id: '1',
    title: '도입',
    thumb: 'https://via.placeholder.com/160x90?text=1',
    content: '이번 프로젝트에서 다루고자 하는 주제와 전체 발표 흐름을 간단히 소개합니다.',
  },
  {
    id: '2',
    title: '문제 정의',
    thumb: 'https://via.placeholder.com/160x90?text=2',
    content: '현재 사용자가 겪고 있는 불편함과 기존 방식의 한계를 정리합니다.',
  },
  {
    id: '3',
    title: '문제 분석',
    thumb: 'https://via.placeholder.com/160x90?text=3',
    content: '문제가 발생하는 원인을 기능·구조·사용 흐름 관점에서 분석합니다.',
  },
  {
    id: '4',
    title: '해결 목표',
    thumb: 'https://via.placeholder.com/160x90?text=4',
    content: '이번 개선을 통해 달성하고자 하는 핵심 목표와 방향성을 정의합니다.',
  },
  {
    id: '5',
    title: '해결 방안',
    thumb: 'https://via.placeholder.com/160x90?text=5',
    content: '문제 해결을 위해 제안하는 주요 기능과 UI/UX 전략을 설명합니다.',
  },
  {
    id: '6',
    title: '기능 구성',
    thumb: 'https://via.placeholder.com/160x90?text=6',
    content: '슬라이드, 스크립트 박스 등 핵심 기능들의 구성과 역할을 소개합니다.',
  },
  {
    id: '7',
    title: '화면 흐름',
    thumb: 'https://via.placeholder.com/160x90?text=7',
    content: '사용자가 화면을 어떻게 탐색하고 상호작용하는지 흐름 중심으로 설명합니다.',
  },
  {
    id: '8',
    title: '기술적 구현',
    thumb: 'https://via.placeholder.com/160x90?text=8',
    content: '레이아웃 분리, 상태 관리 등 구현 과정에서의 핵심 기술적 포인트를 다룹니다.',
  },
  {
    id: '9',
    title: '기대 효과',
    thumb: 'https://via.placeholder.com/160x90?text=9',
    content: '이번 개선으로 사용자 경험과 개발 구조 측면에서 기대되는 효과를 정리합니다.',
  },
  {
    id: '10',
    title: '결론',
    thumb: 'https://via.placeholder.com/160x90?text=10',
    content: '전체 내용을 요약하고, 향후 확장 또는 개선 방향을 제안하며 마무리합니다.',
  },
];
