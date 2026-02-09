/* eslint-disable no-console */
/**
 * MSW 핸들러 — Server 백엔드 API 기반
 *
 * Server src/routes/*.route.js · src/controllers/*.controller.js · src/dtos/*.dto.js 를 기준으로 작성.
 * 모든 응답은 { resultType, error, success } 표준 포맷을 따릅니다.
 */
import { HttpResponse, delay, http } from 'msw';

import type { VideoDto } from '@/api/dto/video.dto';
import type { Presentation } from '@/types/presentation';
import type { SlideListItem } from '@/types/slide';
import type { SlideDetail } from '@/types/slide';
import type { MockVideo } from '@/types/video';

import {
  getMockProjectAnalyticsSummary,
  getMockSlideAnalytics,
  getMockVideoExitAnalytics,
} from './analytics';
import { MOCK_PROJECTS } from './projects';
import { MOCK_SLIDES } from './slides';
import { MOCK_CURRENT_USER, MOCK_USERS } from './users';
import { MOCK_VIDEO } from './videos';

// ── URL Constants ────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || BASE_URL;

// ── Response Helpers ─────────────────────────────────────────
const ok = <T>(data: T) =>
  HttpResponse.json({ resultType: 'SUCCESS' as const, error: null, success: data });

const fail = (status: number, errorCode: string, reason: string) =>
  HttpResponse.json(
    { resultType: 'FAILURE' as const, error: { errorCode, reason, data: null }, success: null },
    { status },
  );

let idSeq = Date.now();
const nextId = () => String(++idSeq);

// ── In-memory Stores ─────────────────────────────────────────
let slides: SlideDetail[] = [...MOCK_SLIDES];
let presentations: Presentation[] = [...MOCK_PROJECTS];

// 댓글 저장소
interface StoredComment {
  commentId: string;
  content: string;
  parentId?: string;
  userId: string;
  slideId: string;
  createdAt: string;
  updatedAt: string;
}
const slideComments = new Map<string, StoredComment[]>();
const commentReplies = new Map<string, StoredComment[]>();

// 댓글 초기화 (slide opinions → comment stores)
MOCK_SLIDES.forEach((slide) => {
  const opinions = slide.comments ?? [];
  if (opinions.length === 0) return;
  const roots: StoredComment[] = [];
  for (const op of opinions) {
    const stored: StoredComment = {
      commentId: op.commentId,
      content: op.content,
      parentId: op.parentId,
      userId: op.userId,
      slideId: slide.slideId,
      createdAt: op.createdAt,
      updatedAt: op.createdAt,
    };
    if (op.parentId) {
      const arr = commentReplies.get(op.parentId) ?? [];
      arr.push(stored);
      commentReplies.set(op.parentId, arr);
    } else {
      roots.push(stored);
    }
  }
  if (roots.length > 0) slideComments.set(slide.slideId, roots);
});

// 스크립트 버전 저장소
const scriptVersions = new Map<
  string,
  { versionNumber: number; scriptText: string; charCount: number; createdAt: string }[]
>();
slides.forEach((s) => {
  if (s.history && s.history.length > 0) scriptVersions.set(s.slideId, [...s.history]);
});

// 영상 댓글 저장소
interface StoredVideoComment {
  commentId: string;
  content: string;
  timestampMs: number;
  userId: string;
  userName: string;
  createdAt: string;
}
const videoComments = new Map<string, StoredVideoComment[]>();

// 공유 링크 저장소
interface StoredShareLink {
  shareToken: string;
  projectId: string;
  scope: string;
  videoId?: string;
  viewCount: number;
  createdAt: string;
}
const shareLinks = new Map<string, StoredShareLink>();

// ── Reaction 저장소 (slide reactions) ────────────────────────
// slideId → { [emojiType]: count }
const slideReactions = new Map<string, Record<string, number>>();
slides.forEach((s) => {
  if (s.emojiReactions) {
    const map: Record<string, number> = {};
    s.emojiReactions.forEach((r) => {
      map[r.type] = r.count;
    });
    slideReactions.set(s.slideId, map);
  }
});

// ═══════════════════════════════════════════════════════════════
//  AUTH — /auth/:provider/callback, /auth/logout, /users/:userId
// ═══════════════════════════════════════════════════════════════

const authCallbackHandler = async ({ request }: { request: Request }) => {
  await delay(200);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return fail(400, 'A001', '인증 코드가 없습니다.');

  const user = MOCK_CURRENT_USER;
  return ok({
    message: '소셜 로그인 성공!',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      sessionId: user.sessionId,
    },
    tokens: {
      accessToken: `mock-access-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`,
    },
  });
};

const authHandlers = [
  http.get(`${AUTH_BASE_URL}/auth/google/callback`, authCallbackHandler),
  http.get(`${AUTH_BASE_URL}/auth/kakao/callback`, authCallbackHandler),
  http.get(`${AUTH_BASE_URL}/auth/naver/callback`, authCallbackHandler),

  // 로그아웃
  http.post(`${BASE_URL}/auth/logout`, async () => {
    await delay(100);
    return ok({ message: '성공적으로 로그아웃되었습니다.', user: { id: MOCK_CURRENT_USER.id } });
  }),

  // 회원 탈퇴
  http.delete(`${BASE_URL}/users/:userId`, async () => {
    await delay(100);
    return ok({
      message: '계정이 성공적으로 삭제되었습니다.',
      user: { id: MOCK_CURRENT_USER.id },
      withdrawnAt: new Date().toISOString(),
    });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  SESSION — /session/anonymous, /session/merge
// ═══════════════════════════════════════════════════════════════

const sessionHandlers = [
  http.post(`${BASE_URL}/session/anonymous`, async () => {
    await delay(100);
    const sessionId = crypto.randomUUID();
    return ok({
      message: '익명 세션이 성공적으로 발급되었습니다.',
      sessionId,
      accessToken: `mock-anon-access-${sessionId}`,
      refreshToken: `mock-anon-refresh-${sessionId}`,
      expiresIn: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  http.post(`${BASE_URL}/session/merge`, async () => {
    await delay(100);
    return ok({ message: '데이터 병합이 완료되었습니다.', mergedProjectsCount: 0 });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  PROJECTS — /presentations
// ═══════════════════════════════════════════════════════════════

const projectHandlers = [
  // 목록 조회 (페이지네이션 + 검색 + 정렬)
  http.get(`${BASE_URL}/presentations`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const search = url.searchParams.get('search') ?? '';
    const sort = url.searchParams.get('sort') ?? 'latest';
    const maxDuration = Number(url.searchParams.get('maxDuration') ?? '0');

    let filtered = [...presentations];
    if (search.length >= 2) {
      filtered = filtered.filter((p) => p.title.includes(search));
    }
    if (Number.isFinite(maxDuration) && maxDuration > 0) {
      filtered = filtered.filter((p) => p.durationSeconds <= maxDuration);
    }

    if (sort === 'latest') filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    else if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'feedback')
      filtered.sort((a, b) => (b.feedbackCount ?? 0) - (a.feedbackCount ?? 0));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return ok({
      presentations: paged,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }),

  // 생성
  http.post(`${BASE_URL}/presentations`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { title?: string; uploadedFileId?: string };
    const id = nextId();
    const now = new Date().toISOString();
    const newPresentation: Presentation = {
      projectId: id,
      title: body.title || '새 프레젠테이션',
      slideCount: 0,
      feedbackCount: 0,
      reactionCount: 0,
      viewCount: 0,
      durationSeconds: 0,
      createdAt: now,
      updatedAt: now,
    };
    presentations.unshift(newPresentation);
    return ok({
      message: '프로젝트가 생성되었습니다. 변환이 시작됩니다.',
      projectId: id,
      title: newPresentation.title,
      createdAt: now,
    });
  }),

  // 익명 프로젝트 생성
  http.post(`${BASE_URL}/presentations/anonymous`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { title?: string };
    const id = nextId();
    const now = new Date().toISOString();
    presentations.unshift({
      projectId: id,
      title: body.title || '새 프레젠테이션',
      slideCount: 0,
      feedbackCount: 0,
      durationSeconds: 0,
      createdAt: now,
      updatedAt: now,
    });
    return ok({ projectId: id, title: body.title || '새 프레젠테이션', updatedAt: now });
  }),

  // 단일 프로젝트 조회
  http.get(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
    await delay(150);
    const { projectId } = params as { projectId: string };
    const project = presentations.find((p) => p.projectId === projectId);
    if (!project) return fail(404, 'P001', '프로젝트를 찾을 수 없습니다.');
    return ok(project);
  }),

  // 수정
  http.patch(`${BASE_URL}/presentations/:projectId`, async ({ params, request }) => {
    await delay(150);
    const { projectId } = params as { projectId: string };
    const body = (await request.json()) as { title?: string };
    const target = presentations.find((p) => p.projectId === projectId);
    if (!target) return fail(404, 'P001', '프로젝트를 찾을 수 없습니다.');

    if (body.title) target.title = body.title;
    target.updatedAt = new Date().toISOString();
    return ok({ projectId, title: target.title, updatedAt: target.updatedAt });
  }),

  // 삭제
  http.delete(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
    await delay(150);
    const { projectId } = params as { projectId: string };
    presentations = presentations.filter((p) => p.projectId !== projectId);
    slides = slides.filter((s) => s.projectId !== projectId);
    return ok({ message: '프로젝트가 성공적으로 삭제되었습니다.' });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  SLIDES — /presentations/:projectId/slides, /presentations/slides/:slideId
// ═══════════════════════════════════════════════════════════════

const slideHandlers = [
  // 프로젝트별 슬라이드 목록
  http.get(`${BASE_URL}/presentations/:projectId/slides`, async ({ params }) => {
    await delay(200);
    const { projectId } = params as { projectId: string };
    const projectSlides = slides
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.slideNum - b.slideNum);
    return ok(projectSlides);
  }),

  // 단일 슬라이드 조회 (prevSlideId, nextSlideId 포함)
  http.get(`${BASE_URL}/presentations/slides/:slideId`, async ({ params }) => {
    await delay(150);
    const { slideId } = params as { slideId: string };
    const slide = slides.find((s) => s.slideId === slideId);
    if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

    const siblings = slides
      .filter((s) => s.projectId === slide.projectId)
      .sort((a, b) => a.slideNum - b.slideNum);
    const idx = siblings.findIndex((s) => s.slideId === slideId);

    return ok({
      slideId: slide.slideId,
      projectId: slide.projectId,
      title: slide.title,
      slideNum: slide.slideNum,
      imageUrl: slide.imageUrl,
      prevSlideId: idx > 0 ? siblings[idx - 1].slideId : null,
      nextSlideId: idx < siblings.length - 1 ? siblings[idx + 1].slideId : null,
      updatedAt: slide.updatedAt,
    });
  }),

  // 슬라이드 수정 (제목)
  http.patch(`${BASE_URL}/presentations/slides/:slideId`, async ({ params, request }) => {
    await delay(150);
    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { title?: string };
    const slide = slides.find((s) => s.slideId === slideId);
    if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

    if (body.title) slide.title = body.title;
    slide.updatedAt = new Date().toISOString();
    return ok({
      slideId: slide.slideId,
      title: slide.title,
      slideNum: slide.slideNum,
      imageUrl: slide.imageUrl,
      updatedAt: slide.updatedAt,
    });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  SCRIPTS — /presentations/slides/:slideId/script, /versions, /restore
// ═══════════════════════════════════════════════════════════════

const scriptHandlers = [
  // 스크립트 조회
  http.get(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params }) => {
    await delay(100);
    const { slideId } = params as { slideId: string };
    const slide = slides.find((s) => s.slideId === slideId);
    if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

    const text = slide.script ?? '';
    return ok({
      message: '대본이 성공적으로 조회되었습니다.',
      slideId,
      charCount: text.length,
      scriptText: text,
      estimatedDurationSeconds: Math.ceil(text.length / 5),
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    });
  }),

  // 스크립트 저장
  http.patch(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params, request }) => {
    await delay(150);
    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { script?: string };
    const slide = slides.find((s) => s.slideId === slideId);
    if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

    const text = body.script ?? '';
    if (slide.script === text) {
      return ok({
        message: '변경사항이 없어 저장되지 않았습니다.',
        slideId,
        charCount: text.length,
        scriptText: text,
        estimatedDurationSeconds: Math.ceil(text.length / 5),
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt,
      });
    }

    slide.script = text;
    slide.updatedAt = new Date().toISOString();

    // 버전 추가
    const versions = scriptVersions.get(slideId) ?? [];
    const nextVer = versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) + 1 : 1;
    versions.push({
      versionNumber: nextVer,
      scriptText: text,
      charCount: text.length,
      createdAt: slide.updatedAt,
    });
    scriptVersions.set(slideId, versions);

    return ok({
      message: '대본이 성공적으로 저장되었습니다',
      slideId,
      charCount: text.length,
      scriptText: text,
      estimatedDurationSeconds: Math.ceil(text.length / 5),
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    });
  }),

  // 버전 목록
  http.get(`${BASE_URL}/presentations/slides/:slideId/versions`, async ({ params }) => {
    await delay(100);
    const { slideId } = params as { slideId: string };
    return ok(scriptVersions.get(slideId) ?? []);
  }),

  // 버전 복원
  http.post(`${BASE_URL}/presentations/slides/:slideId/restore`, async ({ params, request }) => {
    await delay(200);
    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { version: number };
    const versions = scriptVersions.get(slideId) ?? [];
    const target = versions.find((v) => v.versionNumber === body.version);
    if (!target) return fail(404, 'SC001', '해당 버전을 찾을 수 없습니다.');

    const slide = slides.find((s) => s.slideId === slideId);
    if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

    slide.script = target.scriptText;
    slide.updatedAt = new Date().toISOString();

    return ok({
      message: '대본이 성공적으로 저장되었습니다',
      slideId,
      charCount: target.charCount,
      scriptText: target.scriptText,
      estimatedDurationSeconds: Math.ceil(target.charCount / 5),
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  COMMENTS — /slides/:slideId/comments, /comments/:commentId/*
// ═══════════════════════════════════════════════════════════════

const commentHandlers = [
  // 슬라이드 댓글 목록 (페이지네이션)
  http.get(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
    await delay(150);
    const { slideId } = params as { slideId: string };
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '20');

    const all = [...(slideComments.get(slideId) ?? [])].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    const total = all.length;
    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);

    return ok({
      comments: paged.map((c) => {
        const user = MOCK_USERS.find((u) => u.id === c.userId) ?? MOCK_CURRENT_USER;
        return {
          commentId: c.commentId,
          content: c.content,
          user: { userId: c.userId, nickName: user.name },
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  // 슬라이드 댓글 작성
  http.post(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
    await delay(200);
    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { content: string };
    const commentId = nextId();
    const now = new Date().toISOString();
    const comment: StoredComment = {
      commentId,
      content: body.content,
      userId: MOCK_CURRENT_USER.id,
      slideId,
      createdAt: now,
      updatedAt: now,
    };
    const arr = slideComments.get(slideId) ?? [];
    arr.push(comment);
    slideComments.set(slideId, arr);

    return ok({
      commentId: commentId,
      content: body.content,
      userId: MOCK_CURRENT_USER.id,
      createdAt: now,
    });
  }),

  // 답글 작성
  http.post(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
    await delay(200);
    const { commentId: parentId } = params as { commentId: string };
    const body = (await request.json()) as { content: string };

    // 부모 댓글의 slideId 탐색 (slideComments → commentReplies 순)
    let parentSlideId = '';
    for (const [sid, comments] of slideComments) {
      if (comments.some((c) => c.commentId === parentId)) {
        parentSlideId = sid;
        break;
      }
    }
    if (!parentSlideId) {
      for (const replies of commentReplies.values()) {
        const found = replies.find((r) => r.commentId === parentId);
        if (found) {
          parentSlideId = found.slideId;
          break;
        }
      }
    }
    // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 허용
    if (!parentSlideId) parentSlideId = 'unknown';

    const newCommentId = nextId();
    const now = new Date().toISOString();
    const reply: StoredComment = {
      commentId: newCommentId,
      content: body.content,
      parentId: parentId,
      userId: MOCK_CURRENT_USER.id,
      slideId: parentSlideId,
      createdAt: now,
      updatedAt: now,
    };
    const arr = commentReplies.get(parentId) ?? [];
    arr.push(reply);
    commentReplies.set(parentId, arr);

    return ok({
      parentCommentId: parentId,
      replyId: newCommentId,
      content: body.content,
      userId: MOCK_CURRENT_USER.id,
      createdAt: now,
    });
  }),

  // 답글 목록
  http.get(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
    await delay(100);
    const { commentId } = params as { commentId: string };
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '20');

    const all = [...(commentReplies.get(commentId) ?? [])].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    const total = all.length;
    const start = (page - 1) * limit;
    const paged = all.slice(start, start + limit);

    return ok({
      comments: paged.map((r) => {
        const user = MOCK_USERS.find((u) => u.id === r.userId) ?? MOCK_CURRENT_USER;
        return {
          commentId: r.commentId,
          content: r.content,
          user: { userId: r.userId, nickName: user.name },
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  // 댓글 수정
  http.patch(`${BASE_URL}/comments/:commentId`, async ({ params, request }) => {
    await delay(150);
    const { commentId } = params as { commentId: string };
    const body = (await request.json()) as { content: string };

    // slideComments에서 검색
    for (const comments of slideComments.values()) {
      const c = comments.find((c) => c.commentId === commentId);
      if (c) {
        c.content = body.content;
        c.updatedAt = new Date().toISOString();
        return ok({
          updatedTargetType: 'comment',
          commentId,
          content: c.content,
          userId: c.userId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        });
      }
    }
    // commentReplies에서 검색
    for (const replies of commentReplies.values()) {
      const r = replies.find((r) => r.commentId === commentId);
      if (r) {
        r.content = body.content;
        r.updatedAt = new Date().toISOString();
        return ok({
          updatedTargetType: 'reply',
          replyId: commentId,
          parentCommentId: r.parentId,
          content: r.content,
          userId: r.userId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
    }
    // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 성공 처리
    const now = new Date().toISOString();
    return ok({
      updatedTargetType: 'comment',
      commentId,
      content: body.content,
      userId: MOCK_CURRENT_USER.id,
      createdAt: now,
      updatedAt: now,
    });
  }),

  // 댓글 삭제
  http.delete(`${BASE_URL}/comments/:commentId`, async ({ params }) => {
    await delay(150);
    const { commentId } = params as { commentId: string };

    // slideComments에서 삭제
    for (const [sid, comments] of slideComments) {
      const idx = comments.findIndex((c) => c.commentId === commentId);
      if (idx !== -1) {
        comments.splice(idx, 1);
        slideComments.set(sid, comments);
        commentReplies.delete(commentId);
        return ok({ deletedTargetType: 'comment', commentId });
      }
    }
    // commentReplies에서 삭제
    for (const [pid, replies] of commentReplies) {
      const idx = replies.findIndex((r) => r.commentId === commentId);
      if (idx !== -1) {
        replies.splice(idx, 1);
        commentReplies.set(pid, replies);
        return ok({ deletedTargetType: 'reply', replyId: commentId, parentCommentId: pid });
      }
    }
    // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 성공 처리
    return ok({ deletedTargetType: 'comment', commentId });
  }),

  // 영상 댓글 작성
  http.post(`${BASE_URL}/videos/:videoId/comments`, async ({ params, request }) => {
    await delay(200);
    const { videoId } = params as { videoId: string };
    const body = (await request.json()) as { content: string; timestampMs: number };
    const commentId = nextId();
    const now = new Date().toISOString();
    const comment: StoredVideoComment = {
      commentId,
      content: body.content,
      timestampMs: body.timestampMs,
      userId: MOCK_CURRENT_USER.id,
      userName: MOCK_CURRENT_USER.name,
      createdAt: now,
    };
    const arr = videoComments.get(videoId) ?? [];
    arr.push(comment);
    videoComments.set(videoId, arr);
    return ok({ commentId, content: body.content, timestampMs: body.timestampMs, createdAt: now });
  }),

  // 영상 댓글 조회 (타임스탬프 기준)
  http.get(`${BASE_URL}/videos/:videoId/comments`, async ({ params, request }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    const url = new URL(request.url);
    const timestamp = Number(url.searchParams.get('timestamp') ?? '0');
    const windowMs = 5000;
    const all = videoComments.get(videoId) ?? [];
    const filtered = all.filter(
      (c) => c.timestampMs >= timestamp - windowMs && c.timestampMs <= timestamp + windowMs,
    );
    return ok({
      comments: filtered.map((c) => ({
        commentId: c.commentId,
        content: c.content,
        timestampMs: c.timestampMs,
        user: { userId: c.userId, nickName: c.userName },
        createdAt: c.createdAt,
      })),
    });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  REACTIONS — /slides/:slideId/reactions/*, /videos/:videoId/reactions/*
// ═══════════════════════════════════════════════════════════════

const reactionHandlers = [
  // 슬라이드 리액션 토글
  http.post(`${BASE_URL}/slides/:slideId/reactions/toggle`, async ({ params, request }) => {
    await delay(100);
    const { slideId } = params as { slideId: string };
    const body = (await request.json()) as { emojiType: string };
    const reactions = slideReactions.get(slideId) ?? {};
    const current = reactions[body.emojiType] ?? 0;
    // 간단 토글: 짝수면 추가, 홀수면 제거
    reactions[body.emojiType] = current + 1;
    slideReactions.set(slideId, reactions);
    return ok({ active: true });
  }),

  // 슬라이드 리액션 요약
  http.get(`${BASE_URL}/slides/:slideId/reactions/summary`, async ({ params }) => {
    await delay(100);
    const { slideId } = params as { slideId: string };
    const reactions = slideReactions.get(slideId) ?? {};
    const filled = {
      fire: reactions.fire ?? 0,
      good: reactions.good ?? 0,
      bad: reactions.bad ?? 0,
      sleepy: reactions.sleepy ?? 0,
      confused: reactions.confused ?? 0,
    };
    return ok({ slideId, reactions: filled });
  }),

  // 프로젝트 슬라이드 리액션 총합
  http.get(`${BASE_URL}/presentations/:projectId/slides/reactions/summary`, async ({ params }) => {
    await delay(100);
    const { projectId } = params as { projectId: string };
    const projectSlides = slides.filter((s) => s.projectId === projectId);
    const total: Record<string, number> = {
      fire: 0,
      good: 0,
      bad: 0,
      sleepy: 0,
      confused: 0,
    };
    let totalCount = 0;
    projectSlides.forEach((s) => {
      const r = slideReactions.get(s.slideId) ?? {};
      Object.entries(r).forEach(([type, count]) => {
        total[type] = (total[type] ?? 0) + count;
        totalCount += count;
      });
    });
    return ok({ projectId, totalReactions: total, totalCount });
  }),

  // 영상 리액션 토글
  http.post(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    await request.json();
    return ok({ reactionId: nextId(), videoId, active: true });
  }),

  // 영상 리액션 타임라인
  http.get(`${BASE_URL}/videos/:videoId/reactions/timeline`, async ({ params, request }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    const url = new URL(request.url);
    const intervalMs = Number(url.searchParams.get('intervalMs') ?? '5000');

    // MOCK_VIDEO feedbacks에서 타임라인 마커 생성
    const markers: { timestampMs: number; emojiType: string; count: number }[] = [];
    if (videoId === MOCK_VIDEO.videoId) {
      MOCK_VIDEO.feedbacks.forEach((fb) => {
        const bucket = Math.floor(fb.timestampMs / intervalMs) * intervalMs;
        fb.reactions.forEach((r) => {
          if (r.count > 0) markers.push({ timestampMs: bucket, emojiType: r.type, count: r.count });
        });
      });
    }
    return ok({ intervalMs, markers });
  }),

  // 영상 리액션 (특정 시점)
  http.get(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    const url = new URL(request.url);
    const timestampMs = Number(url.searchParams.get('timestampMs') ?? '0');
    const windowMs = Number(url.searchParams.get('windowMs') ?? '2000');

    const result: { emojiType: string; count: number }[] = [];
    if (videoId === MOCK_VIDEO.videoId) {
      const totals: Record<string, number> = {};
      MOCK_VIDEO.feedbacks.forEach((fb) => {
        if (fb.timestampMs >= timestampMs - windowMs && fb.timestampMs <= timestampMs + windowMs) {
          fb.reactions.forEach((r) => {
            totals[r.type] = (totals[r.type] ?? 0) + r.count;
          });
        }
      });
      Object.entries(totals).forEach(([type, count]) => result.push({ emojiType: type, count }));
    }
    return ok(result);
  }),
];

// ═══════════════════════════════════════════════════════════════
//  VIDEOS — /videos/*, /presentations/:projectId/videos
// ═══════════════════════════════════════════════════════════════

const videoHandlers = [
  // 녹화 시작
  http.post(`${BASE_URL}/videos/start`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { projectId: number; title: string };
    return ok({ videoId: nextId(), ...body });
  }),

  // 청크 업로드
  http.post(`${BASE_URL}/videos/:videoId/chunks/:chunkIndex`, async () => {
    await delay(100);
    return ok({ ok: true });
  }),

  // 녹화 완료
  http.post(`${BASE_URL}/videos/:videoId/finish`, async ({ params, request }) => {
    await delay(300);
    const { videoId } = params as { videoId: string };
    const body = (await request.json()) as {
      slideLogs: { slideId: number; timestampMs: number }[];
    };
    return ok({
      videoId,
      status: 'processing',
      slideCount: body.slideLogs.length,
      slideDurations: body.slideLogs.map((log) => ({
        slideId: String(log.slideId),
        totalDurationMs: 30000,
      })),
    });
  }),

  // 프로젝트별 영상 목록 (검색/필터/정렬 지원)
  http.get(`${BASE_URL}/presentations/:projectId/videos`, async ({ params, request }) => {
    await delay(200);
    const { projectId } = params as { projectId: string };
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const filter = url.searchParams.get('filter') || 'all';
    const sort = url.searchParams.get('sort') || 'recent';

    console.log(`[MSW] GET /presentations/${projectId}/videos`, { search, filter, sort });

    // localStorage에서 읽기
    const storedData = localStorage.getItem('mockVideos');
    if (!storedData) {
      return ok({ videos: [], total: 0 });
    }

    const localVideos: MockVideo[] = JSON.parse(storedData) as MockVideo[];

    // 해당 프로젝트의 영상만 필터링
    const projectVideos = localVideos.filter((video) => video.projectId === projectId);

    // VideoDto 형식으로 변환
    let videos: VideoDto[] = projectVideos.map((video) => ({
      videoId: String(video.id),
      title: video.title,
      status: 'ready' as const,
      durationSeconds: video.durationSeconds,
      rootCommentCount: video.rootCommentCount,
      replyCount: video.replyCount,
      reactionCount: video.reactionCount,
      viewCount: video.viewCount,
      thumbnailUrl: `https://example.com/thumb${video.id}.jpg`,
      createdAt: video.createdAt,
    }));

    // 검색 필터링
    if (search) {
      videos = videos.filter((video) => video.title.toLowerCase().includes(search.toLowerCase()));
    }

    // 듀레이션 필터링
    if (filter === '3m') {
      videos = videos.filter((video) => video.durationSeconds <= 180);
    } else if (filter === '5m') {
      videos = videos.filter((video) => video.durationSeconds <= 300);
    }

    // 정렬
    if (sort === 'recent') {
      videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'commentCount') {
      videos.sort(
        (a, b) => b.rootCommentCount + b.replyCount - (a.rootCommentCount + a.replyCount),
      );
    } else if (sort === 'name') {
      videos.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }

    return ok({ videos, total: videos.length });
  }),

  // 영상 상세 (timeline 포함)
  http.get(`${BASE_URL}/videos/:videoId`, async ({ params }) => {
    await delay(200);
    const { videoId } = params as { videoId: string };
    if (videoId !== MOCK_VIDEO.videoId) return fail(404, 'V001', '영상을 찾을 수 없습니다.');

    // MOCK_VIDEO feedbacks → Server timeline 포맷으로 변환
    const timelineReactions: { timestampMs: number; emojiType: string; count: number }[] = [];
    const timelineComments: {
      commentId: string;
      timestampMs: number;
      content: string;
      createdAt: string;
      user: { userId: string; name: string };
    }[] = [];

    MOCK_VIDEO.feedbacks.forEach((fb) => {
      fb.reactions.forEach((r) => {
        if (r.count > 0) {
          timelineReactions.push({
            timestampMs: fb.timestampMs * 1000, // seconds → ms
            emojiType: r.type,
            count: r.count,
          });
        }
      });
      fb.comments.forEach((c) => {
        const user = MOCK_USERS.find((u) => u.id === c.userId);
        timelineComments.push({
          commentId: c.commentId,
          timestampMs: fb.timestampMs,
          content: c.content,
          createdAt: c.createdAt,
          user: { userId: c.userId, name: user?.name ?? '알 수 없음' },
        });
      });
    });

    return ok({
      video: {
        videoId: MOCK_VIDEO.videoId,
        title: MOCK_VIDEO.title,
        status: 'ready',
        durationSeconds: MOCK_VIDEO.duration,
        width: 1920,
        height: 1080,
        fps: 30,
        hlsMasterUrl: MOCK_VIDEO.videoUrl,
        thumbnailUrl: null,
        createdAt: new Date().toISOString(),
      },
      timeline: { reactions: timelineReactions, comments: timelineComments },
    });
  }),

  // 영상-슬라이드 타임라인
  http.get(`${BASE_URL}/videos/:videoId/slides`, async ({ params }) => {
    await delay(100);
    const { videoId } = params as { videoId: string };
    if (videoId !== MOCK_VIDEO.videoId) return fail(404, 'V001', '영상을 찾을 수 없습니다.');
    // p1 프로젝트의 처음 5개 슬라이드로 타임라인 생성
    const p1Slides = slides
      .filter((s) => s.projectId === 'p1')
      .sort((a, b) => a.slideNum - b.slideNum)
      .slice(0, 5);
    return ok({
      slides: p1Slides.map((s, i) => ({
        slideId: s.slideId,
        timestampMs: i * Math.floor((MOCK_VIDEO.duration * 1000) / 5),
      })),
    });
  }),
];
// ═══════════════════════════════════════════════════════════════
//  SHARES — /presentations/:projectId/shares, /shares/:shareToken
// ═══════════════════════════════════════════════════════════════

const shareHandlers = [
  // 공유 링크 생성
  http.post(`${BASE_URL}/presentations/:projectId/shares`, async ({ params, request }) => {
    await delay(200);
    const { projectId } = params as { projectId: string };
    const body = (await request.json()) as {
      scope: string;
      videoId?: string;
      expiredAt?: string;
    };
    const shareToken = crypto.randomUUID();
    const now = new Date().toISOString();
    const project = presentations.find((p) => p.projectId === projectId);

    shareLinks.set(shareToken, {
      shareToken,
      projectId,
      scope: body.scope,
      videoId: body.videoId,
      viewCount: 0,
      createdAt: now,
    });

    return ok({
      projectId,
      scope: body.scope,
      shareToken,
      shareUrl: `${window.location.origin}/shares/${shareToken}`,
      sharedContentSummary: {
        scope: body.scope,
        projectTitle: project?.title ?? '',
        videoTitle: body.videoId ? MOCK_VIDEO.title : null,
        videoCreatedAt: body.videoId ? now : null,
        thumbnailUrl: project?.thumbnailUrl ?? null,
      },
      createdAt: now,
    });
  }),

  // 공유 콘텐츠 조회 (인증 불필요)
  http.get(`${BASE_URL}/shares/:shareToken`, async ({ params }) => {
    await delay(200);
    const { shareToken } = params as { shareToken: string };
    const link = shareLinks.get(shareToken);
    if (!link) return fail(404, 'SH001', '공유 링크를 찾을 수 없습니다.');

    link.viewCount++;
    const project = presentations.find((p) => p.projectId === link.projectId);
    const projectSlides = slides
      .filter((s) => s.projectId === link.projectId)
      .sort((a, b) => a.slideNum - b.slideNum);

    return ok({
      message: '공유된 프로젝트에 접속했습니다.',
      sessionInfo: {
        sessionId: crypto.randomUUID(),
        tokens: {
          accessToken: `mock-share-access-${shareToken}`,
          refreshToken: `mock-share-refresh-${shareToken}`,
        },
      },
      shareInfo: { shareToken, scope: link.scope, createdAt: link.createdAt },
      projectContent: {
        title: project?.title ?? '',
        slides: projectSlides.map((s) => ({
          slideId: s.slideId,
          slideNum: s.slideNum,
          imageUrl: s.imageUrl,
          scriptText: s.script ?? '',
        })),
        video:
          link.scope === 'slides_script_video'
            ? {
                videoId: MOCK_VIDEO.videoId,
                videoUrl: MOCK_VIDEO.videoUrl,
                thumbnailUrl: null,
              }
            : null,
      },
    });
  }),

  // 공유 링크 목록
  http.get(`${BASE_URL}/presentations/:projectId/shares`, async ({ params }) => {
    await delay(100);
    const { projectId } = params as { projectId: string };
    const links: StoredShareLink[] = [];
    for (const link of shareLinks.values()) {
      if (link.projectId === projectId) links.push(link);
    }
    return ok(
      links.map((l) => ({
        scope: l.scope,
        shareToken: l.shareToken,
        isActive: true,
        viewCount: l.viewCount,
        videoTitle: l.videoId ? MOCK_VIDEO.title : null,
        createdAt: l.createdAt,
      })),
    );
  }),

  // 공유용 영상 목록
  http.get(`${BASE_URL}/presentations/:projectId/shares/videos`, async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    const allVideos = [
      {
        id: MOCK_VIDEO.videoId,
        title: MOCK_VIDEO.title,
        thumbnailUrl: null as string | null,
        createdAt: new Date().toISOString(),
      },
    ];
    const start = (page - 1) * pageSize;
    const paged = allVideos.slice(start, start + pageSize);

    return ok({
      videos: paged,
      pagination: { currentPage: page, totalCount: allVideos.length, hasNext: false },
    });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  FILES — /files/upload
// ═══════════════════════════════════════════════════════════════

const fileHandlers = [
  http.post(`${BASE_URL}/files/upload`, async () => {
    await delay(500);
    const id = nextId();
    // 파일 업로드 시 프로젝트 자동 생성
    const now = new Date().toISOString();
    presentations.unshift({
      projectId: id,
      title: '업로드된 프레젠테이션',
      slideCount: 5,
      feedbackCount: 0,
      durationSeconds: 0,
      createdAt: now,
      updatedAt: now,
    });
    return ok({ projectId: id });
  }),

  // 변환 상태 조회
  http.get(`${BASE_URL}/presentations/:projectId/status`, async () => {
    await delay(100);
    return ok({ status: 'completed', progress: 100 });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS — /presentations/:projectId/analytics/*, /analytics/*
// ═══════════════════════════════════════════════════════════════

const analyticsHandlers = [
  // 프로젝트 요약
  http.get(`${BASE_URL}/presentations/:projectId/analytics/summary`, async ({ params }) => {
    await delay(150);
    const { projectId } = params as { projectId: string };
    return ok(getMockProjectAnalyticsSummary(projectId));
  }),

  // 슬라이드별 분석
  http.get(`${BASE_URL}/presentations/:projectId/analytics/slides`, async ({ params }) => {
    await delay(150);
    const { projectId } = params as { projectId: string };
    return ok(getMockSlideAnalytics(projectId));
  }),

  // 영상 이탈 분석
  http.get(`${BASE_URL}/videos/:videoId/analytics/exits`, async ({ params }) => {
    await delay(150);
    const { videoId } = params as { videoId: string };
    return ok(getMockVideoExitAnalytics(videoId));
  }),

  // 영상 타임라인 분석
  http.get(`${BASE_URL}/videos/:videoId/analytics/timeline`, async () => {
    await delay(100);
    const timeline = [];
    for (let t = 0; t <= MOCK_VIDEO.duration * 1000; t += 30000) {
      timeline.push({
        timestampMs: t,
        reactionCount: Math.floor(Math.random() * 10),
        commentCount: Math.floor(Math.random() * 3),
        feedbackCount: Math.floor(Math.random() * 13),
      });
    }
    return ok({ timeline });
  }),

  // 페이지뷰 기록
  http.post(`${BASE_URL}/analytics/pageview`, async () => {
    await delay(50);
    return ok({ ok: true });
  }),

  // 슬라이드 조회 기록
  http.post(`${BASE_URL}/analytics/slide-view`, async () => {
    await delay(50);
    return ok({ ok: true });
  }),

  // 영상 이벤트 기록
  http.post(`${BASE_URL}/analytics/video-event`, async () => {
    await delay(50);
    return ok({ ok: true });
  }),

  // 이탈 기록
  http.post(`${BASE_URL}/analytics/exit`, async () => {
    await delay(50);
    return ok({ ok: true });
  }),
];

// ═══════════════════════════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════════════════════════

export const handlers = [
  ...authHandlers,
  ...sessionHandlers,
  ...projectHandlers,
  ...slideHandlers,
  ...scriptHandlers,
  ...commentHandlers,
  ...reactionHandlers,
  ...videoHandlers,
  ...shareHandlers,
  ...fileHandlers,
  ...analyticsHandlers,
];
