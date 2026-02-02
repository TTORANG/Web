/* eslint-disable no-console */
import { HttpResponse, delay, http } from 'msw';

import { createDefaultReactions } from '@/constants/reaction';
import { FEEDBACK_WINDOW } from '@/constants/video';
import type { Project } from '@/types/project';
import type { Slide } from '@/types/slide';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';

import { MOCK_PROJECTS } from './projects';
import { MOCK_SLIDES } from './slides';
import { MOCK_USERS } from './users';
import { MOCK_VIDEO } from './videos';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 메모리 내 데이터 저장소 (상태 유지)
let slides: Slide[] = [...MOCK_SLIDES];
let projects: Project[] = [...MOCK_PROJECTS];

// 영상 피드백 데이터 저장소
const videoFeedbacks: Map<string, VideoFeedback> = new Map([
  [MOCK_VIDEO.videoId, structuredClone(MOCK_VIDEO)],
]);

// 슬라이드별 스크립트 버전 저장소 (slides의 history로 초기화)
const scriptVersions: Map<
  string,
  { versionNumber: number; scriptText: string; charCount: number; createdAt: string }[]
> = new Map();

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

// API 에러 응답 헬퍼
const wrapError = (errorCode: string, reason: string, data?: unknown) => ({
  resultType: 'FAILURE' as const,
  error: { errorCode, reason, data },
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
   * GET /projects
   */
  http.get(`${BASE_URL}/projects`, async () => {
    await delay(200);
    console.log('[MSW] GET /projects');
    return HttpResponse.json(wrapResponse(projects));
  }),

  /**
   * 프로젝트 상세 조회
   * GET /projects/:projectId
   */
  http.get(`${BASE_URL}/projects/:projectId`, async ({ params }) => {
    await delay(150);
    const { projectId } = params;
    console.log(`[MSW] GET /projects/${projectId}`);

    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Project not found')), {
        status: 404,
      });
    }

    return HttpResponse.json(wrapResponse(project));
  }),

  /**
   * 프로젝트 생성
   * POST /projects
   */
  http.post(`${BASE_URL}/projects`, async ({ request }) => {
    await delay(300);
    const data = (await request.json()) as { title: string };
    console.log('[MSW] POST /projects', data);

    const newProject: Project = {
      id: `p${Date.now()}`,
      title: data.title,
      updatedAt: new Date().toISOString(),
      durationMinutes: 0,
      pageCount: 0,
      commentCount: 0,
      reactionCount: 0,
      viewCount: 0,
      thumbnailUrl: '/thumbnails/p1/0.webp',
    };

    projects = [newProject, ...projects];
    return HttpResponse.json(wrapResponse(newProject), { status: 201 });
  }),

  /**
   * 프로젝트 수정
   * PATCH /projects/:projectId
   */
  http.patch(`${BASE_URL}/projects/:projectId`, async ({ params, request }) => {
    await delay(200);
    const { projectId } = params;
    const data = (await request.json()) as { title?: string };
    console.log(`[MSW] PATCH /projects/${projectId}`, data);

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Project not found')), {
        status: 404,
      });
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(wrapResponse(projects[projectIndex]));
  }),

  /**
   * 프로젝트 삭제
   * DELETE /projects/:projectId
   */
  http.delete(`${BASE_URL}/projects/:projectId`, async ({ params }) => {
    await delay(200);
    const { projectId } = params;
    console.log(`[MSW] DELETE /projects/${projectId}`);

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Project not found')), {
        status: 404,
      });
    }

    projects = projects.filter((p) => p.id !== projectId);
    return HttpResponse.json(wrapResponse(null), { status: 200 });
  }),

  // =====================
  // 슬라이드 관련 핸들러
  // =====================

  /**
   * 프로젝트의 슬라이드 목록 조회
   * GET /projects/:projectId/slides
   */
  http.get(`${BASE_URL}/projects/:projectId/slides`, async ({ params }) => {
    await delay(200); // 네트워크 지연 시뮬레이션

    const { projectId } = params;
    console.log(`[MSW] GET /projects/${projectId}/slides`);

    const projectSlides = slides.filter((s) => s.projectId === projectId);
    return HttpResponse.json(wrapResponse(projectSlides));
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
    }

    return HttpResponse.json(wrapResponse(slide));
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
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
   * POST /projects/:projectId/slides
   */
  http.post(`${BASE_URL}/projects/:projectId/slides`, async ({ params, request }) => {
    await delay(300);

    const { projectId } = params as { projectId: string };
    const data = (await request.json()) as { title: string; script?: string };
    console.log(`[MSW] POST /projects/${projectId}/slides`, data);

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
   * DELETE /slides/:slideId
   */
  http.delete(`${BASE_URL}/slides/:slideId`, async ({ params }) => {
    await delay(200);

    const { slideId } = params;
    console.log(`[MSW] DELETE /slides/${slideId}`);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
    }

    slides = slides.filter((s) => s.id !== slideId);

    return HttpResponse.json(wrapResponse(null), { status: 200 });
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Opinion not found')), {
        status: 404,
      });
    }

    return HttpResponse.json(wrapResponse(null), { status: 200 });
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
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

    return HttpResponse.json({
      timestamp: targetFeedback.timestamp,
      reactions: targetFeedback.reactions,
    });
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
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
    const { script } = (await request.json()) as { script: string };
    console.log(`[MSW] PATCH /presentations/slides/${slideId}/script`);

    const slideIndex = slides.findIndex((s) => s.id === slideId);

    if (slideIndex === -1) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
    }

    const currentSlide = slides[slideIndex];

    // 기존 스크립트가 있으면 버전 저장
    if (currentSlide.script.trim() && currentSlide.script !== script) {
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
    slides[slideIndex] = { ...currentSlide, script };

    return HttpResponse.json(
      wrapResponse({
        message: '대본이 성공적으로 저장되었습니다.',
        slideId,
        charCount: script.length,
        scriptText: script,
        estimatedDurationSeconds: Math.ceil(script.length / 5),
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
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
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Slide not found')), {
        status: 404,
      });
    }

    const versions = scriptVersions.get(slideId) || [];
    const targetVersion = versions.find((v) => v.versionNumber === version);

    if (!targetVersion) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Version not found')), {
        status: 404,
      });
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

  // =====================
  // 영상 관련 핸들러
  // =====================

  /**
   * 영상 생성
   * POST /videos
   */
  http.post(`${BASE_URL}/videos`, async ({ request }) => {
    await delay(300);
    const data = (await request.json()) as { projectId: number; title: string };
    console.log('[MSW] POST /videos', data);

    const videoId = crypto.randomUUID();

    return HttpResponse.json(wrapResponse({ videoId }), { status: 201 });
  }),

  /**
   * 영상 파일 업로드
   * POST /videos/:videoId/upload
   */
  http.post(`${BASE_URL}/videos/:videoId/upload`, async ({ params }) => {
    await delay(1000);
    const { videoId } = params as { videoId: string };
    console.log(`[MSW] POST /videos/${videoId}/upload`);

    return HttpResponse.json(wrapResponse({ ok: true }));
  }),

  /**
   * 녹화 종료 및 영상 처리
   * POST /videos/:videoId/finish
   */
  http.post(`${BASE_URL}/videos/:videoId/finish`, async ({ params, request }) => {
    await delay(500);
    const { videoId } = params as { videoId: string };
    const data = (await request.json()) as {
      slideLogs: Array<{ slideId: number; timestampMs: number }>;
    };
    console.log(`[MSW] POST /videos/${videoId}/finish`, data);

    return HttpResponse.json(wrapResponse({ ok: true }));
  }),

  /**
   * 영상 상세 조회
   * GET /videos/:videoId
   */
  http.get(`${BASE_URL}/videos/:videoId`, async ({ params }) => {
    await delay(200);
    const { videoId } = params as { videoId: string };
    console.log(`[MSW] GET /videos/${videoId}`);

    const video = videoFeedbacks.get(videoId);

    if (!video) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Video not found')), {
        status: 404,
      });
    }

    // VideoFeedback을 GetVideoDetailResponse 형식으로 변환
    const response = {
      video: {
        id: video.videoId,
        title: video.title,
        status: 'ready' as const,
        durationSeconds: video.duration,
        width: 1920,
        height: 1080,
        fps: 30,
        hlsMasterUrl: video.videoUrl,
        thumbnailUrl: '/mock-thumbnail.jpg',
        createdAt: new Date().toISOString(),
      },
      timeline: {
        reactions: video.feedbacks.flatMap((f) =>
          f.reactions.map((r) => ({
            timestampMs: f.timestamp * 1000,
            emojiType: r.type as
              | 'thumbs_up'
              | 'thumbs_down'
              | 'heart'
              | 'laugh'
              | 'surprised'
              | 'thinking',
            count: r.count,
          })),
        ),
        comments: video.comments.map((c) => ({
          id: c.id,
          content: c.content,
          timestampMs: new Date(c.timestamp).getTime(), // Comment 타입의 timestamp를 변환
          createdAt: c.timestamp,
          user: { id: c.authorId, name: MOCK_USERS[0].name },
        })),
      },
    };

    return HttpResponse.json(wrapResponse(response));
  }),

  /**
   * 영상 슬라이드 타임라인 조회
   * GET /videos/:videoId/slides
   */
  http.get(`${BASE_URL}/videos/:videoId/slides`, async ({ params }) => {
    await delay(150);
    const { videoId } = params as { videoId: string };
    console.log(`[MSW] GET /videos/${videoId}/slides`);

    const video = videoFeedbacks.get(videoId);

    if (!video) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Video not found')), {
        status: 404,
      });
    }

    // Mock slide timeline
    const slides = [
      { slideId: '1', timestampMs: 0 },
      { slideId: '2', timestampMs: 30000 },
      { slideId: '3', timestampMs: 60000 },
    ];

    return HttpResponse.json(wrapResponse({ slides }));
  }),

  /**
   * 영상 리액션 토글
   * POST /videos/:videoId/reactions
   */
  http.post(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    const data = (await request.json()) as { emojiType: string; timestampMs: number };
    console.log(`[MSW] POST /videos/${videoId}/reactions`, data);

    const video = videoFeedbacks.get(videoId);

    if (!video) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Video not found')), {
        status: 404,
      });
    }

    // 리액션 토글 로직 (실제로는 video.feedbacks를 업데이트)
    return HttpResponse.json(wrapResponse({ active: true }));
  }),

  /**
   * 영상 댓글 생성
   * POST /videos/:videoId/comments
   */
  http.post(`${BASE_URL}/videos/:videoId/comments`, async ({ params, request }) => {
    await delay(200);
    const { videoId } = params as { videoId: string };
    const data = (await request.json()) as { content: string; timestampMs: number };
    console.log(`[MSW] POST /videos/${videoId}/comments`, data);

    const video = videoFeedbacks.get(videoId);

    if (!video) {
      return new HttpResponse(JSON.stringify(wrapError('NOT_FOUND', 'Video not found')), {
        status: 404,
      });
    }

    const newComment = {
      id: crypto.randomUUID(),
      authorId: MOCK_USERS[0].id,
      content: data.content,
      timestamp: new Date().toISOString(),
      isMine: true,
    };

    video.comments.push(newComment);

    // API response로 VideoComment 형식 반환
    const responseComment = {
      id: newComment.id,
      content: newComment.content,
      timestampMs: data.timestampMs,
      createdAt: newComment.timestamp,
      user: { id: MOCK_USERS[0].id, name: MOCK_USERS[0].name },
    };

    return HttpResponse.json(wrapResponse(responseComment), { status: 201 });
  }),
];
