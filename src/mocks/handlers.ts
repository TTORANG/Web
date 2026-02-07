/* eslint-disable no-console */
import { HttpResponse, delay, http } from 'msw';

import { createDefaultReactions } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import type { Presentation } from '@/types/presentation';
import type { Slide } from '@/types/slide';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';

import {
  getMockProjectAnalyticsSummary,
  getMockSlideAnalytics,
  getMockVideoExitAnalytics,
} from './analytics';
import { MOCK_PROJECTS } from './projects';
import { MOCK_SLIDES } from './slides';
import { MOCK_USERS } from './users';
import { MOCK_VIDEO } from './videos';

const envBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = envBaseUrl.replace(/\/$/, '');

// 메모리 내 데이터 저장소 (상태 유지)
let slides: Slide[] = [...MOCK_SLIDES];
let presentations: Presentation[] = [...MOCK_PROJECTS];

// 영상 피드백 데이터 저장소
const videoFeedbacks: Map<string, VideoFeedback> = new Map([
  [MOCK_VIDEO.videoId, structuredClone(MOCK_VIDEO)],
]);

// 슬라이드별 스크립트 버전 저장소 (slides의 history로 초기화)
const scriptVersions: Map<
  string,
  { versionNumber: number; scriptText: string; charCount: number; createdAt: string }[]
> = new Map();

// 댓글 저장소 (슬라이드별)
interface StoredComment {
  id: string;
  content: string;
  parentId?: string;
  userId: string;
  slideId?: string;
  createdAt: string;
  updatedAt: string;
}

const slideComments: Map<string, StoredComment[]> = new Map();
const commentReplies: Map<string, StoredComment[]> = new Map();

// slides의 history 데이터로 scriptVersions 초기화
MOCK_SLIDES.forEach((slide) => {
  if (slide.history.length > 0) {
    scriptVersions.set(slide.id, [...slide.history]);
  }
});

// API 응답 래퍼 헬퍼
const wrapResponse = <T>(data: T) => ({
  resultType: 'SUCCESS' as const,
  error: null,
  success: data,
});

const wrapError = (errorCode: string, reason: string) => ({
  resultType: 'FAILURE' as const,
  error: { errorCode, reason },
  success: null,
});

/**
 * MSW 핸들러 정의
 *
 * API 엔드포인트별 모킹 로직을 정의합니다.
 * 개발 환경에서 실제 서버 없이 API 테스트가 가능합니다.
 */
export const handlers = [
  // =====================
  // 프로젝트 관련 핸들러
  // =====================

  /**
   * 프로젝트 목록 조회
   * GET /presentations
   */
  http.get(`${BASE_URL}/presentations`, async ({ request }) => {
    await delay(200);
    console.log('[MSW] GET /presentations');

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const total = presentations.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPresentations = presentations.slice(startIndex, endIndex);

    return HttpResponse.json(
      wrapResponse({
        presentations: paginatedPresentations,
        total,
        page,
        limit,
        totalPages,
      }),
    );
  }),

  /**
   * 프로젝트 상세 조회
   * GET /presentations/:projectId
   */
  http.get(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
    await delay(200);
    const { projectId } = params;
    console.log(`[MSW] GET /presentations/${projectId}`);

    const presentation = presentations.find((p) => p.projectId === projectId);

    if (!presentation) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Presentation not found',
      });
    }

    return HttpResponse.json(wrapResponse(presentation));
  }),

  /**
   * 프로젝트 생성
   * POST /presentations
   */
  http.post(`${BASE_URL}/presentations`, async ({ request }) => {
    await delay(300);
    const data = (await request.json()) as { title: string };
    console.log('[MSW] POST /presentations', data);

    const newPresentation: Presentation = {
      projectId: `p${Date.now()}`,
      title: data.title,
      userName: MOCK_USERS[0].name,
      updatedAt: new Date().toISOString(),
      reactionCount: 0,
      viewCount: 0,
      thumbnailUrl: '/thumbnails/p1/0.webp',
      slideCount: 0,
      feedbackCount: 0,
      durationSeconds: 0,
      createdAt: new Date().toISOString(),
    };

    presentations = [newPresentation, ...presentations];
    return HttpResponse.json(wrapResponse({ ...newPresentation, message: 'Created' }), {
      status: 201,
    });
  }),

  /**
   * 프로젝트 수정
   * PATCH /presentations/:projectId
   */
  http.patch(`${BASE_URL}/presentations/:projectId`, async ({ params, request }) => {
    await delay(200);
    const { projectId } = params;
    const data = (await request.json()) as { title?: string };
    console.log(`[MSW] PATCH /presentations/${projectId}`, data);

    const presentationIndex = presentations.findIndex((p) => p.projectId === projectId);

    if (presentationIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Presentation not found',
      });
    }

    presentations[presentationIndex] = {
      ...presentations[presentationIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(wrapResponse(presentations[presentationIndex]));
  }),

  /**
   * 프로젝트 삭제
   * DELETE /presentations/:projectId
   */
  http.delete(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
    await delay(200);
    const { projectId } = params;
    console.log(`[MSW] DELETE /presentations/${projectId}`);

    const presentationIndex = presentations.findIndex((p) => p.projectId === projectId);

    if (presentationIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Presentation not found',
      });
    }

    presentations = presentations.filter((p) => p.projectId !== projectId);
    return new HttpResponse(null, { status: 204 });
  }),

  // =====================
  // 슬라이드 관련 핸들러
  // =====================

  /**
   * 프로젝트의 슬라이드 목록 조회
   * GET /projects/:projectId/slides
   */
  http.get(`${BASE_URL}/projects/:projectId/slides`, async ({ params }) => {
    await delay(200);

    const { projectId } = params;
    const presentationSlides = slides
      .filter((s) => s.projectId === projectId)
      .map((s, index) => ({
        slideId: s.id,
        projectId: s.projectId,
        title: s.title,
        slideNum: index + 1,
        imageUrl: s.thumb,
        script: s.script,
        opinions: s.opinions,
        emojiReactions: s.emojiReactions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    return HttpResponse.json(wrapResponse(presentationSlides));
  }),

  /**
   * 프로젝트의 슬라이드 목록 조회 (Legacy)
   * GET /presentations/:projectId/slides
   */
  http.get(`${BASE_URL}/presentations/:projectId/slides`, async ({ params }) => {
    await delay(200);

    const { projectId } = params;
    console.log(`[MSW] GET /presentations/${projectId}/slides (legacy)`);

    const presentationSlides = slides
      .filter((s) => s.projectId === projectId)
      .map((s, index) => ({
        slideId: s.id,
        projectId: s.projectId,
        title: s.title,
        slideNum: index + 1,
        imageUrl: s.thumb,
        script: s.script,
        opinions: s.opinions,
        emojiReactions: s.emojiReactions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    return HttpResponse.json(wrapResponse(presentationSlides));
  }),

  /**
   * 특정 슬라이드 조회
   * GET /presentations/slides/:slideId
   */
  http.get(`${BASE_URL}/presentations/slides/:slideId`, async ({ params }) => {
    await delay(150);

    const { slideId } = params;
    console.log(`[MSW] GET /presentations/slides/${slideId}`);

    const slide = slides.find((s) => s.id === slideId);

    if (!slide) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    return HttpResponse.json(wrapResponse(slide));
  }),

  /**
   * 슬라이드 수정
   * PATCH /presentations/slides/:slideId
   */
  http.patch(`${BASE_URL}/presentations/slides/:slideId`, async ({ params, request }) => {
    await delay(200);

    const { slideId } = params;
    const updates = (await request.json()) as Partial<Slide>;
    console.log(`[MSW] PATCH /presentations/slides/${slideId}`, updates);

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
        versionNumber: currentSlide.history.length + 1,
        scriptText: currentSlide.script,
        charCount: currentSlide.script.length,
        createdAt: new Date().toISOString(),
      });
    }

    // 슬라이드 업데이트
    slides[slideIndex] = {
      ...currentSlide,
      ...updates,
    };

    return HttpResponse.json(wrapResponse(slides[slideIndex]));
  }),

  /**
   * 슬라이드 생성
   * POST /presentations/:projectId/slides
   */
  http.post(`${BASE_URL}/presentations/:projectId/slides`, async ({ params, request }) => {
    await delay(300);

    const { projectId } = params as { projectId: string };
    const data = (await request.json()) as { title: string; script?: string };
    console.log(`[MSW] POST /presentations/${projectId}/slides`, data);

    const newSlide: Slide = {
      id: crypto.randomUUID(),
      projectId,
      title: data.title,
      thumb: `/thumbnails/slide-${slides.length % 52}.webp`,
      script: data.script || '',
      opinions: [],
      history: [],
      emojiReactions: [],
    };

    slides.push(newSlide);

    return HttpResponse.json(wrapResponse(newSlide), { status: 201 });
  }),

  /**
   * 슬라이드 삭제
   * DELETE /presentations/slides/:slideId
   */
  http.delete(`${BASE_URL}/presentations/slides/:slideId`, async ({ params }) => {
    await delay(200);

    const { slideId } = params;
    console.log(`[MSW] DELETE /presentations/slides/${slideId}`);

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
      userId: MOCK_USERS[0].id,
      content: data.content,
      createdAt: new Date().toISOString(),
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
        console.warn(
          `[MSW] Parent opinion with id "${data.parentId}" not found. Adding as a root comment.`,
        );
        slides[slideIndex].opinions.push(newOpinion);
      }
    } else {
      slides[slideIndex].opinions.push(newOpinion);
    }

    return HttpResponse.json(wrapResponse(newOpinion), { status: 201 });
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
    const { type } = (await request.json()) as { type: string };
    console.log(`[MSW] POST /slides/${slideId}/reactions`, type);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Slide not found',
      });
    }

    const slide = slides[slideIndex];
    const reactionIndex = slide.emojiReactions.findIndex((r) => r.type === type);

    if (reactionIndex !== -1) {
      // 이미 있으면 토글 (count 증감, active 토글)
      const currentReaction = slide.emojiReactions[reactionIndex];
      if (currentReaction.active) {
        currentReaction.count = Math.max(0, currentReaction.count - 1);
        currentReaction.active = false;
      } else {
        currentReaction.count += 1;
        currentReaction.active = true;
      }
    }

    return HttpResponse.json(wrapResponse(slide.emojiReactions));
  }),

  /**
   * 영상 리액션 토글
   * POST /videos/:videoId/reactions
   */
  http.post(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
    await delay(100);

    const { videoId } = params as { videoId: string };
    const { type, timestamp } = (await request.json()) as { type: string; timestamp: number };
    console.log(`[MSW] POST /videos/${videoId}/reactions`, { type, timestamp });

    const video = videoFeedbacks.get(videoId);

    if (!video) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Video not found',
      });
    }

    // 타임스탬프 범위 내 피드백 찾기
    let targetFeedback = video.feedbacks.find(
      (f) => Math.abs(f.timestamp - timestamp) <= FEEDBACK_WINDOW,
    );

    // 없으면 새로 생성
    if (!targetFeedback) {
      targetFeedback = {
        timestamp,
        comments: [],
        reactions: createDefaultReactions(),
      } satisfies VideoTimestampFeedback;
      video.feedbacks.push(targetFeedback);
      video.feedbacks.sort((a, b) => a.timestamp - b.timestamp);
    }

    // 리액션 토글
    const reactionIndex = targetFeedback.reactions.findIndex((r) => r.type === type);
    if (reactionIndex !== -1) {
      const currentReaction = targetFeedback.reactions[reactionIndex];
      if (currentReaction.active) {
        currentReaction.count = Math.max(0, currentReaction.count - 1);
        currentReaction.active = false;
      } else {
        currentReaction.count += 1;
        currentReaction.active = true;
      }
    }

    return HttpResponse.json(
      wrapResponse({
        timestamp: targetFeedback.timestamp,
        reactions: targetFeedback.reactions,
      }),
    );
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
        code: 'TEST_FAILURE',
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
    return HttpResponse.json(
      wrapResponse({
        user: MOCK_USERS[0],
        accessToken: 'mock-access-token',
      }),
    );
  }),

  /**
   * 내 정보 조회
   * GET /users/me
   */
  http.get(`${BASE_URL}/users/me`, async () => {
    await delay(200);
    console.log('[MSW] GET /users/me');
    return HttpResponse.json(wrapResponse(MOCK_USERS[0]));
  }),

  /**
   * 대본 조회
   * GET /presentations/slides/:slideId/script
   */
  http.get(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params }) => {
    await delay(150);

    const { slideId } = params;
    console.log(`[MSW] GET /presentations/slides/${slideId}/script`);

    const slide = slides.find((s) => s.id === slideId);

    if (!slide) {
      return HttpResponse.json(wrapError('NOT_FOUND', 'Slide not found'), { status: 404 });
    }

    return HttpResponse.json(
      wrapResponse({
        message: '대본이 성공적으로 조회되었습니다.',
        slideId: slide.id,
        charCount: slide.script.length,
        scriptText: slide.script,
        estimatedDurationSeconds: Math.ceil(slide.script.length / 5),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  }),

  /**
   * 대본 저장
   * PATCH /presentations/slides/:slideId/script
   */
  http.patch(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params, request }) => {
    await delay(200);

    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { script: string };
    console.log(`[MSW] PATCH /presentations/slides/${slideId}/script`, {
      slideId,
      scriptLength: body.script?.length,
      body,
    });

    if (!body || body.script === undefined) {
      console.error('[MSW] 대본 저장 요청 body가 올바르지 않습니다:', body);
      return HttpResponse.json(wrapError('INVALID_REQUEST', 'script field is required'), {
        status: 400,
      });
    }

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return HttpResponse.json(wrapError('NOT_FOUND', 'Slide not found'), { status: 404 });
    }

    const currentSlide = slides[slideIndex];

    // 기존 스크립트가 있으면 버전 저장
    if (currentSlide.script.trim() && currentSlide.script !== body.script) {
      const versions = scriptVersions.get(slideId) || [];
      versions.unshift({
        versionNumber: versions.length + 1,
        scriptText: currentSlide.script,
        charCount: currentSlide.script.length,
        createdAt: new Date().toISOString(),
      });
      scriptVersions.set(slideId, versions);
    }

    // 스크립트 업데이트
    slides[slideIndex] = { ...currentSlide, script: body.script };

    return HttpResponse.json(
      wrapResponse({
        message: '대본이 성공적으로 저장되었습니다.',
        slideId,
        charCount: body.script.length,
        scriptText: body.script,
        estimatedDurationSeconds: Math.ceil(body.script.length / 5),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  }),

  /**
   * 대본 버전(히스토리) 목록 조회
   * GET /presentations/slides/:slideId/versions
   */
  http.get(`${BASE_URL}/presentations/slides/:slideId/versions`, async ({ params }) => {
    await delay(150);

    const { slideId } = params as { slideId: string };
    console.log(`[MSW] GET /presentations/slides/${slideId}/versions`);

    const slide = slides.find((s) => s.id === slideId);

    if (!slide) {
      return HttpResponse.json(wrapError('NOT_FOUND', 'Slide not found'), { status: 404 });
    }

    const versions = scriptVersions.get(slideId) || [];
    return HttpResponse.json(wrapResponse(versions));
  }),

  /**
   * 대본 복원
   * POST /presentations/slides/:slideId/restore
   */
  http.post(`${BASE_URL}/presentations/slides/:slideId/restore`, async ({ params, request }) => {
    await delay(200);

    const { slideId } = params as { slideId: string };
    const { version } = (await request.json()) as { version: number };
    console.log(`[MSW] POST /presentations/slides/${slideId}/restore`, { version });

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return HttpResponse.json(wrapError('NOT_FOUND', 'Slide not found'), { status: 404 });
    }

    const versions = scriptVersions.get(slideId) || [];
    const targetVersion = versions.find((v) => v.versionNumber === version);

    if (!targetVersion) {
      return HttpResponse.json(wrapError('NOT_FOUND', 'Version not found'), { status: 404 });
    }

    // 현재 스크립트를 버전으로 저장
    const currentSlide = slides[slideIndex];
    if (currentSlide.script.trim()) {
      versions.unshift({
        versionNumber: versions.length + 1,
        scriptText: currentSlide.script,
        charCount: currentSlide.script.length,
        createdAt: new Date().toISOString(),
      });
      scriptVersions.set(slideId, versions);
    }

    // 복원
    slides[slideIndex] = { ...currentSlide, script: targetVersion.scriptText };

    return HttpResponse.json(
      wrapResponse({
        message: '대본이 성공적으로 복원되었습니다.',
        slideId,
        charCount: targetVersion.charCount,
        scriptText: targetVersion.scriptText,
        estimatedDurationSeconds: Math.ceil(targetVersion.charCount / 5),
        createdAt: targetVersion.createdAt,
        updatedAt: new Date().toISOString(),
      }),
    );
  }),

  /**
   * 영상 세션 생성
   * POST /videos/start
   */
  http.post(`${BASE_URL}/videos/start`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { projectId: number; title: string };
    console.log('[MSW] POST /videos/start', body);

    const videoId = Math.floor(Math.random() * 100000) + 1;

    return HttpResponse.json({
      resultType: 'SUCCESS',
      error: null,
      success: {
        videoId,
      },
    });
  }),

  /**
   * POST /videos/:videoId/chunks/:chunkIndex
   */
  http.post(`${BASE_URL}/videos/:videoId/chunks/:chunkIndex`, async ({ params, request }) => {
    await delay(50);
    const { videoId, chunkIndex } = params;

    const formData = await request.formData();
    const file = formData.get('file');

    if (file instanceof Blob) {
      console.log(
        `[MSW] POST /videos/${videoId}/chunks/${chunkIndex} - ${(file.size / 1024).toFixed(2)} KB`,
      );
    }

    return HttpResponse.json({
      resultType: 'SUCCESS',
      error: null,
      success: {
        ok: true,
      },
    });
  }),

  /**
   * POST /videos/:videoId/finish
   */
  http.post(`${BASE_URL}/videos/:videoId/finish`, async ({ params, request }) => {
    await delay(300);
    const { videoId } = params;
    const body = (await request.json()) as {
      slideLogs: Array<{ slideId: number; timestampMs: number }>;
    };

    console.log(`[MSW] POST /videos/${videoId}/finish`, body);

    const slideLogs = body.slideLogs || [];
    const slideDurations = slideLogs.map((log, index) => ({
      slideId: String(log.slideId),
      totalDurationMs:
        index < slideLogs.length - 1 ? slideLogs[index + 1].timestampMs - log.timestampMs : 5000,
    }));

    return HttpResponse.json({
      resultType: 'SUCCESS',
      error: null,
      success: {
        videoId: String(videoId),
        status: 'processing',
        slideCount: slideLogs.length,
        slideDurations,
      },
    });
  }),

  /**
   * 영상 상세 조회
   * GET /videos/:videoId
   */
  http.get(`${BASE_URL}/videos/:videoId`, async ({ params }) => {
    await delay(150);
    const { videoId } = params;
    console.log(`[MSW] GET /videos/${videoId}`);

    return HttpResponse.json({
      resultType: 'SUCCESS',
      error: null,
      success: {
        video: {
          id: String(videoId),
          title: 'Q4 마케팅 전략 발표',
          status: 'ready',
          durationSeconds: 300,
          width: 1920,
          height: 1080,
          fps: 30,
          hlsMasterUrl: 'https://example.com/master.m3u8',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          createdAt: new Date().toISOString(),
        },
      },
    });
  }),

  /**
   * 슬라이드 댓글 목록 조회
   * GET /slides/:slideId/comments
   */
  http.get(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
    await delay(150);
    const { slideId } = params as { slideId: string };
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    console.log(`[MSW] GET /slides/${slideId}/comments`, { page, limit });

    const comments = slideComments.get(slideId) || [];
    const total = comments.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    const commentsWithUser = paginatedComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.userId,
        nickName: MOCK_USERS.find((u) => u.id === comment.userId)?.name || '익명',
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return HttpResponse.json(
      wrapResponse({
        comments: commentsWithUser,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      }),
    );
  }),

  /**
   * 슬라이드에 댓글 작성
   * POST /slides/:slideId/comments
   */
  http.post(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
    await delay(200);
    const { slideId } = params as { slideId: string };
    const { content } = (await request.json()) as { content: string };

    console.log(`[MSW] POST /slides/${slideId}/comments`, { content });

    const newComment: StoredComment = {
      id: `${Date.now()}`,
      content,
      userId: MOCK_USERS[0].id,
      slideId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const comments = slideComments.get(slideId) || [];
    comments.push(newComment);
    slideComments.set(slideId, comments);

    return HttpResponse.json(
      wrapResponse({
        id: newComment.id,
        content: newComment.content,
        userId: newComment.userId,
        createdAt: newComment.createdAt,
      }),
    );
  }),

  /**
   * 댓글에 답글 작성
   * POST /comments/:commentId/replies
   */
  http.post(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
    await delay(200);
    const { commentId } = params as { commentId: string };
    const { content } = (await request.json()) as { content: string };

    console.log(`[MSW] POST /comments/${commentId}/replies`, { content });

    // 부모 댓글 존재 확인
    let parentExists = false;
    for (const comments of slideComments.values()) {
      if (comments.some((c) => c.id === commentId)) {
        parentExists = true;
        break;
      }
    }

    if (!parentExists) {
      return HttpResponse.json(wrapError('C005', '댓글을 찾을 수 없습니다.'), { status: 404 });
    }

    const newReply: StoredComment = {
      id: `${Date.now()}`,
      content,
      parentId: commentId,
      userId: MOCK_USERS[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const replies = commentReplies.get(commentId) || [];
    replies.push(newReply);
    commentReplies.set(commentId, replies);

    return HttpResponse.json(
      wrapResponse({
        id: newReply.id,
        content: newReply.content,
        parentId: newReply.parentId,
        userId: newReply.userId,
        createdAt: newReply.createdAt,
      }),
    );
  }),

  /**
   * 댓글의 답글 목록 조회
   * GET /comments/:commentId/replies
   */
  http.get(`${BASE_URL}/comments/:commentId/replies`, async ({ params }) => {
    await delay(150);
    const { commentId } = params as { commentId: string };

    console.log(`[MSW] GET /comments/${commentId}/replies`);

    const replies = commentReplies.get(commentId) || [];

    return HttpResponse.json(
      wrapResponse(
        replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          parentId: reply.parentId,
          userId: reply.userId,
          createdAt: reply.createdAt,
        })),
      ),
    );
  }),

  /**
   * 댓글 수정
   * PATCH /comments/:commentId
   */
  http.patch(`${BASE_URL}/comments/:commentId`, async ({ params, request }) => {
    await delay(200);
    const { commentId } = params as { commentId: string };
    const { content } = (await request.json()) as { content: string };

    console.log(`[MSW] PATCH /comments/${commentId}`, { content });

    // 슬라이드 댓글에서 찾기
    let found = false;
    for (const [slideId, comments] of slideComments.entries()) {
      const commentIndex = comments.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1) {
        comments[commentIndex] = {
          ...comments[commentIndex],
          content,
          updatedAt: new Date().toISOString(),
        };
        slideComments.set(slideId, comments);
        found = true;

        return HttpResponse.json(
          wrapResponse({
            id: comments[commentIndex].id,
            content: comments[commentIndex].content,
            userId: comments[commentIndex].userId,
            createdAt: comments[commentIndex].createdAt,
          }),
        );
      }
    }

    // 답글에서 찾기
    if (!found) {
      for (const [parentId, replies] of commentReplies.entries()) {
        const replyIndex = replies.findIndex((r) => r.id === commentId);
        if (replyIndex !== -1) {
          replies[replyIndex] = {
            ...replies[replyIndex],
            content,
            updatedAt: new Date().toISOString(),
          };
          commentReplies.set(parentId, replies);
          found = true;

          return HttpResponse.json(
            wrapResponse({
              id: replies[replyIndex].id,
              content: replies[replyIndex].content,
              userId: replies[replyIndex].userId,
              createdAt: replies[replyIndex].createdAt,
            }),
          );
        }
      }
    }

    if (!found) {
      return HttpResponse.json(wrapError('C005', '댓글을 찾을 수 없습니다.'), { status: 404 });
    }
  }),

  /**
   * 댓글 삭제
   * DELETE /comments/:commentId
   */
  http.delete(`${BASE_URL}/comments/:commentId`, async ({ params }) => {
    await delay(200);
    const { commentId } = params as { commentId: string };

    console.log(`[MSW] DELETE /comments/${commentId}`);

    // 슬라이드 댓글에서 삭제
    let found = false;
    for (const [slideId, comments] of slideComments.entries()) {
      const filteredComments = comments.filter((c) => c.id !== commentId);
      if (filteredComments.length !== comments.length) {
        slideComments.set(slideId, filteredComments);
        // 해당 댓글의 답글도 모두 삭제
        commentReplies.delete(commentId);
        found = true;
        break;
      }
    }

    // 답글에서 삭제
    if (!found) {
      for (const [parentId, replies] of commentReplies.entries()) {
        const filteredReplies = replies.filter((r) => r.id !== commentId);
        if (filteredReplies.length !== replies.length) {
          commentReplies.set(parentId, filteredReplies);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return HttpResponse.json(wrapError('C005', '댓글을 찾을 수 없습니다.'), { status: 404 });
    }

    return HttpResponse.json(wrapResponse(null));
  }),

  // =====================
  // 분석(Analytics) 관련 핸들러
  // =====================

  /**
   * 슬라이드 분석 조회
   * GET /presentations/:projectId/analytics/slides
   */
  http.get(`${BASE_URL}/presentations/:projectId/analytics/slides`, async ({ params }) => {
    await delay(200);
    const { projectId } = params as { projectId: string };
    console.log(`[MSW] GET /presentations/${projectId}/analytics/slides`);

    return HttpResponse.json(wrapResponse(getMockSlideAnalytics(projectId)));
  }),

  /**
   * 프로젝트 분석 요약 조회
   * GET /presentations/:projectId/analytics/summary
   */
  http.get(`${BASE_URL}/presentations/:projectId/analytics/summary`, async ({ params }) => {
    await delay(200);
    const { projectId } = params as { projectId: string };
    console.log(`[MSW] GET /presentations/${projectId}/analytics/summary`);

    return HttpResponse.json(wrapResponse(getMockProjectAnalyticsSummary(projectId)));
  }),

  /**
   * 영상 이탈 분석 조회
   * GET /videos/:videoId/analytics/exits
   */
  http.get(`${BASE_URL}/videos/:videoId/analytics/exits`, async ({ params }) => {
    await delay(200);
    const { videoId } = params as { videoId: string };
    console.log(`[MSW] GET /videos/${videoId}/analytics/exits`);

    return HttpResponse.json(wrapResponse(getMockVideoExitAnalytics(videoId)));
  }),
];
