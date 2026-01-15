/* eslint-disable no-console */
import { HttpResponse, delay, http } from 'msw';

import type { Slide } from '@/types/slide';

import { MOCK_SLIDES } from './slides';
import { MOCK_USERS } from './users';

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

    const currentSlide = slides[slideIndex];

    // 스크립트가 변경되는 경우 히스토리 저장
    if (
      updates.script !== undefined &&
      updates.script !== currentSlide.script &&
      currentSlide.script.trim()
    ) {
      currentSlide.history.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        content: currentSlide.script,
      });
    }

    // 슬라이드 업데이트
    slides[slideIndex] = {
      ...currentSlide,
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
      thumb: `/thumbnails/slide-${slides.length % 52}.webp`,
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

  /**
   * 의견 추가
   * POST /slides/:slideId/opinions
   */
  http.post(`${BASE_URL}/slides/:slideId/opinions`, async ({ params, request }) => {
    await delay(200);

    const { slideId } = params;
    const data = (await request.json()) as { content: string; parentId?: string };
    console.log(`[MSW] POST /slides/${slideId}/opinions`, data);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    const newOpinion = {
      id: crypto.randomUUID(),
      authorId: MOCK_USERS[0].id,
      content: data.content,
      timestamp: new Date().toISOString(),
      isMine: true,
      isReply: !!data.parentId,
      parentId: data.parentId,
    };

    // 답글인 경우 부모 의견 바로 다음에 삽입
    if (data.parentId) {
      const parentIndex = slides[slideIndex].opinions.findIndex((o) => o.id === data.parentId);
      if (parentIndex !== -1) {
        slides[slideIndex].opinions.splice(parentIndex + 1, 0, newOpinion);
      } else {
        slides[slideIndex].opinions.push(newOpinion);
      }
    } else {
      slides[slideIndex].opinions.push(newOpinion);
    }

    return HttpResponse.json(newOpinion, { status: 201 });
  }),

  /**
   * 의견 삭제
   * DELETE /opinions/:opinionId
   */
  http.delete(`${BASE_URL}/opinions/:opinionId`, async ({ params }) => {
    await delay(200);

    const { opinionId } = params;
    console.log(`[MSW] DELETE /opinions/${opinionId}`);

    // 모든 슬라이드에서 해당 의견 찾기
    let found = false;
    for (const slide of slides) {
      const opinionIndex = slide.opinions.findIndex((o) => o.id === opinionId);
      if (opinionIndex !== -1) {
        // 해당 의견과 답글 모두 삭제
        slide.opinions = slide.opinions.filter(
          (o) => o.id !== opinionId && o.parentId !== opinionId,
        );
        found = true;
        break;
      }
    }

    if (!found) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Opinion not found',
      });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  /**
   * 리액션 토글
   * POST /slides/:slideId/reactions
   */
  http.post(`${BASE_URL}/slides/:slideId/reactions`, async ({ params, request }) => {
    await delay(100);

    const { slideId } = params;
    const { emoji } = (await request.json()) as { emoji: string };
    console.log(`[MSW] POST /slides/${slideId}/reactions`, emoji);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    const slide = slides[slideIndex];
    const reactionIndex = slide.emojiReactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex !== -1) {
      // 이미 있으면 토글 (count 증감, active 토글)
      // 단순화를 위해 active가 true면 -1 (취소), false면 +1 (추가)
      const currentReaction = slide.emojiReactions[reactionIndex];
      if (currentReaction.active) {
        currentReaction.count = Math.max(0, currentReaction.count - 1);
        currentReaction.active = false;
      } else {
        currentReaction.count += 1;
        currentReaction.active = true;
      }
    } else {
      // 없으면 새로 추가
      slide.emojiReactions.push({
        emoji,
        count: 1,
        active: true,
        label: emoji === '👍' ? '좋아요' : emoji === '👀' ? '확인했어요' : '반응', // 간단한 라벨 매핑
      });
    }

    return HttpResponse.json(slide.emojiReactions);
  }),

  /**
   * 에러 테스트용 엔드포인트
   * GET /test/error/:status
   * 예: /test/error/400, /test/error/401, /test/error/500
   */
  http.get(`${BASE_URL}/test/error/:status`, async ({ params }) => {
    await delay(100);
    const status = Number(params.status);

    return new HttpResponse(
      JSON.stringify({
        message: `[MSW] 테스트용 ${status} 에러 메시지입니다.`,
        code: 'TEST_ERROR',
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }),

  /**
   * 로그인 (Mock)
   * POST /auth/login/mock
   */
  http.post(`${BASE_URL}/auth/login/mock`, async () => {
    await delay(300);
    console.log('[MSW] POST /auth/login/mock');
    return HttpResponse.json({
      user: MOCK_USERS[0],
      accessToken: 'mock-access-token',
    });
  }),

  /**
   * 내 정보 조회
   * GET /users/me
   */
  http.get(`${BASE_URL}/users/me`, async () => {
    await delay(200);
    console.log('[MSW] GET /users/me');
    return HttpResponse.json(MOCK_USERS[0]);
  }),
];
