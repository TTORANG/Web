/* eslint-disable no-console */
import { HttpResponse, delay, http } from 'msw';

import type { Slide } from '@/types/slide';

import { MOCK_SLIDES } from './slides';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 메모리 내 데이터 저장소 (상태 유지)
let slides: Slide[] = [...MOCK_SLIDES];

/**
 * MSW 핸들러 정의
 *
 * API 엔드포인트별 모킹 로직을 정의합니다.
 * 개발 환경에서 실제 서버 없이 API 테스트가 가능합니다.
 */
export const handlers = [
  /**
   * 프로젝트의 슬라이드 목록 조회
   * GET /projects/:projectId/slides
   */
  http.get(`${BASE_URL}/projects/:projectId/slides`, async ({ params }) => {
    await delay(200); // 네트워크 지연 시뮬레이션

    const { projectId } = params;
    console.log(`[MSW] GET /projects/${projectId}/slides`);

    return HttpResponse.json(slides);
  }),

  /**
   * 특정 슬라이드 조회
   * GET /slides/:slideId
   */
  http.get(`${BASE_URL}/slides/:slideId`, async ({ params }) => {
    await delay(150);

    const { slideId } = params;
    console.log(`[MSW] GET /slides/${slideId}`);

    const slide = slides.find((s) => s.id === slideId);

    if (!slide) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    return HttpResponse.json(slide);
  }),

  /**
   * 슬라이드 수정
   * PATCH /slides/:slideId
   */
  http.patch(`${BASE_URL}/slides/:slideId`, async ({ params, request }) => {
    await delay(200);

    const { slideId } = params;
    const updates = (await request.json()) as Partial<Slide>;
    console.log(`[MSW] PATCH /slides/${slideId}`, updates);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    // 슬라이드 업데이트
    slides[slideIndex] = {
      ...slides[slideIndex],
      ...updates,
    };

    return HttpResponse.json(slides[slideIndex]);
  }),

  /**
   * 슬라이드 생성
   * POST /projects/:projectId/slides
   */
  http.post(`${BASE_URL}/projects/:projectId/slides`, async ({ params, request }) => {
    await delay(300);

    const { projectId } = params;
    const data = (await request.json()) as { title: string; script?: string };
    console.log(`[MSW] POST /projects/${projectId}/slides`, data);

    const newSlide: Slide = {
      id: crypto.randomUUID(),
      title: data.title,
      thumb: `https://via.placeholder.com/160x90?text=${slides.length + 1}`,
      script: data.script || '',
      opinions: [],
      history: [],
      emojiReactions: [],
    };

    slides.push(newSlide);

    return HttpResponse.json(newSlide, { status: 201 });
  }),

  /**
   * 슬라이드 삭제
   * DELETE /slides/:slideId
   */
  http.delete(`${BASE_URL}/slides/:slideId`, async ({ params }) => {
    await delay(200);

    const { slideId } = params;
    console.log(`[MSW] DELETE /slides/${slideId}`);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    slides = slides.filter((s) => s.id !== slideId);

    return new HttpResponse(null, { status: 204 });
  }),
];
