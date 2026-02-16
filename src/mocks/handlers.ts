// /* eslint-disable no-console */
// /**
//  * MSW 핸들러 — Server 백엔드 API 기반
//  *
//  * Server src/routes/*.route.js · src/controllers/*.controller.js · src/dtos/*.dto.js 를 기준으로 작성.
//  * 모든 응답은 { resultType, error, success } 표준 포맷을 따릅니다.
//  */
// import { HttpResponse, delay, http } from 'msw';

// import type { CreateCommentResponseDto, CreateReplyCommentResponseDto } from '@/api/dto';
// import type {
//   CreateChunkUploadResponseDto,
//   CreateCommentRequestDto,
//   CreateFinishVideoRequestDto,
//   CreateFinishVideoResponseDto,
//   CreateStartVideoResponseDto,
//   ReadPresentationVideosResponseDto,
//   ReadVideoDetailResponseDto,
//   ReadVideoSlidesResponseDto,
// } from '@/api/dto/video.dto';
// import type { ApiResponse } from '@/types';
// import type { Presentation } from '@/types/presentation';
// import type { SlideDetail } from '@/types/slide';

// import {
//   getMockPresentationAnalyticsSummary,
//   getMockSlideAnalytics,
//   getMockVideoExitAnalytics,
// } from './analytics';
// import { MOCK_PROJECTS } from './projects';
// import { MOCK_SLIDES } from './slides';
// import { MOCK_CURRENT_USER, MOCK_USERS } from './users';
// import {
//   filterVideosBySearch,
//   filterVideosByStatus,
//   mockSlideTimelines,
//   mockTimelines,
//   mockVideoDetails,
//   mockVideoList,
//   sortVideos,
// } from './videos';

// // ── URL Constants ────────────────────────────────────────────
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || BASE_URL;

// // ── Response Helpers ─────────────────────────────────────────
// const ok = <T>(data: T) =>
//   HttpResponse.json({ resultType: 'SUCCESS' as const, error: null, success: data });

// const fail = (status: number, errorCode: string, reason: string) =>
//   HttpResponse.json(
//     { resultType: 'FAILURE' as const, error: { errorCode, reason, data: null }, success: null },
//     { status },
//   );

// let idSeq = Date.now();
// const nextId = () => String(++idSeq);

// // ── In-memory Stores ─────────────────────────────────────────
// let slides: SlideDetail[] = [...MOCK_SLIDES];
// let presentations: Presentation[] = [...MOCK_PROJECTS];

// // 댓글 저장소
// interface StoredComment {
//   commentId: string;
//   content: string;
//   parentId?: string;
//   userId: string;
//   slideId: string;
//   createdAt: string;
//   updatedAt: string;
// }
// const slideComments = new Map<string, StoredComment[]>();
// const commentReplies = new Map<string, StoredComment[]>();

// // 댓글 초기화 (slide opinions → comment stores)
// MOCK_SLIDES.forEach((slide) => {
//   const opinions = slide.comments ?? [];
//   if (opinions.length === 0) return;
//   const roots: StoredComment[] = [];
//   for (const op of opinions) {
//     const stored: StoredComment = {
//       commentId: op.commentId,
//       content: op.content,
//       parentId: op.parentId,
//       userId: op.userId,
//       slideId: slide.slideId,
//       createdAt: op.createdAt,
//       updatedAt: op.createdAt,
//     };
//     if (op.parentId) {
//       const arr = commentReplies.get(op.parentId) ?? [];
//       arr.push(stored);
//       commentReplies.set(op.parentId, arr);
//     } else {
//       roots.push(stored);
//     }
//   }
//   if (roots.length > 0) slideComments.set(slide.slideId, roots);
// });

// // 스크립트 버전 저장소
// const scriptVersions = new Map<
//   string,
//   { versionNumber: number; scriptText: string; charCount: number; createdAt: string }[]
// >();
// slides.forEach((s) => {
//   if (s.history && s.history.length > 0) scriptVersions.set(s.slideId, [...s.history]);
// });

// // 영상 댓글 저장소
// interface StoredVideoComment {
//   commentId: string;
//   content: string;
//   timestampMs: number;
//   userId: string;
//   userName: string;
//   createdAt: string;
// }
// const videoComments = new Map<string, StoredVideoComment[]>();

// // 공유 링크 저장소
// interface StoredShareLink {
//   shareToken: string;
//   projectId: string;
//   scope: string;
//   videoId?: string;
//   viewCount: number;
//   createdAt: string;
// }
// const shareLinks = new Map<string, StoredShareLink>();

// // ── Reaction 저장소 (slide reactions) ────────────────────────
// // slideId → { [emojiType]: count }
// const slideReactions = new Map<string, Record<string, number>>();
// slides.forEach((s) => {
//   if (s.emojiReactions) {
//     const map: Record<string, number> = {};
//     s.emojiReactions.forEach((r) => {
//       map[r.type] = r.count;
//     });
//     slideReactions.set(s.slideId, map);
//   }
// });

// // ═══════════════════════════════════════════════════════════════
// //  AUTH — /auth/:provider/callback, /auth/logout, /users/:userId
// // ═══════════════════════════════════════════════════════════════

// /**
//  * Mock JWT 생성 (payload만 유효, 서명은 더미)
//  */
// function createMockJwt(payload: Record<string, string>): string {
//   const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
//   const body = btoa(JSON.stringify(payload));
//   return `${header}.${body}.mock-signature`;
// }

// const authCallbackHandler = async ({ request }: { request: Request }) => {
//   await delay(200);
//   const url = new URL(request.url);
//   const code = url.searchParams.get('code');
//   if (!code) return fail(400, 'A001', '인증 코드가 없습니다.');

//   const user = MOCK_CURRENT_USER;
//   const accessToken = createMockJwt({
//     id: user.id,
//     email: user.email,
//     sessionId: user.sessionId,
//   });

//   // 새 플로우: accessToken + sessionId를 URL 파라미터로, refreshToken은 HttpOnly 쿠키로 전달
//   const callbackUrl = new URL('/auth/callback', url.origin);
//   callbackUrl.searchParams.set('accessToken', accessToken);
//   callbackUrl.searchParams.set('sessionId', user.sessionId);

//   return new HttpResponse(null, {
//     status: 302,
//     headers: {
//       Location: callbackUrl.toString(),
//       'Set-Cookie': `refreshToken=mock-refresh-token-${user.id}; HttpOnly; Path=/; SameSite=Lax`,
//     },
//   });
// };

// const authHandlers = [
//   http.get(`${AUTH_BASE_URL}/auth/google/callback`, authCallbackHandler),
//   http.get(`${AUTH_BASE_URL}/auth/kakao/callback`, authCallbackHandler),
//   http.get(`${AUTH_BASE_URL}/auth/naver/callback`, authCallbackHandler),

//   // 로그아웃
//   http.post(`${BASE_URL}/auth/logout`, async () => {
//     await delay(100);
//     return ok({ message: '성공적으로 로그아웃되었습니다.', user: { id: MOCK_CURRENT_USER.id } });
//   }),

//   // 회원 탈퇴
//   http.delete(`${BASE_URL}/users/:userId`, async () => {
//     await delay(100);
//     return ok({
//       message: '계정이 성공적으로 삭제되었습니다.',
//       user: { id: MOCK_CURRENT_USER.id },
//       withdrawnAt: new Date().toISOString(),
//     });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  SESSION — /session/anonymous, /session/merge
// // ═══════════════════════════════════════════════════════════════

// const sessionHandlers = [
//   http.post(`${BASE_URL}/session/anonymous`, async () => {
//     await delay(100);
//     const sessionId = crypto.randomUUID();
//     return ok({
//       message: '익명 세션이 성공적으로 발급되었습니다.',
//       sessionId,
//       accessToken: `mock-anon-access-${sessionId}`,
//       refreshToken: `mock-anon-refresh-${sessionId}`,
//       expiresIn: '7d',
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//     });
//   }),

//   http.post(`${BASE_URL}/session/merge`, async () => {
//     await delay(100);
//     return ok({ message: '데이터 병합이 완료되었습니다.', mergedProjectsCount: 0 });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  PROJECTS — /presentations
// // ═══════════════════════════════════════════════════════════════

// const projectHandlers = [
//   // 목록 조회 (페이지네이션 + 검색 + 정렬)
//   http.get(`${BASE_URL}/presentations`, async ({ request }) => {
//     await delay(200);
//     const url = new URL(request.url);
//     const page = Number(url.searchParams.get('page') ?? '1');
//     const limit = Number(url.searchParams.get('limit') ?? '20');
//     const search = url.searchParams.get('search') ?? '';
//     const sort = url.searchParams.get('sort') ?? 'latest';
//     const maxDuration = Number(url.searchParams.get('maxDuration') ?? '0');

//     let filtered = [...presentations];
//     if (search.length >= 2) {
//       filtered = filtered.filter((p) => p.title.includes(search));
//     }
//     if (Number.isFinite(maxDuration) && maxDuration > 0) {
//       filtered = filtered.filter((p) => p.durationSeconds <= maxDuration);
//     }

//     if (sort === 'latest') filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
//     else if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
//     else if (sort === 'feedback')
//       filtered.sort((a, b) => (b.feedbackCount ?? 0) - (a.feedbackCount ?? 0));

//     const total = filtered.length;
//     const start = (page - 1) * limit;
//     const paged = filtered.slice(start, start + limit);

//     return ok({
//       presentations: paged,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     });
//   }),

//   // 생성
//   http.post(`${BASE_URL}/presentations`, async ({ request }) => {
//     await delay(300);
//     const body = (await request.json()) as { title?: string; uploadedFileId?: string };
//     const id = nextId();
//     const now = new Date().toISOString();
//     const newPresentation: Presentation = {
//       projectId: id,
//       title: body.title || '새 프레젠테이션',
//       slideCount: 0,
//       feedbackCount: 0,
//       reactionCount: 0,
//       viewCount: 0,
//       durationSeconds: 0,
//       createdAt: now,
//       updatedAt: now,
//     };
//     presentations.unshift(newPresentation);
//     return ok({
//       message: '프로젝트가 생성되었습니다. 변환이 시작됩니다.',
//       projectId: id,
//       title: newPresentation.title,
//       createdAt: now,
//     });
//   }),

//   // 익명 프로젝트 생성
//   http.post(`${BASE_URL}/presentations/anonymous`, async ({ request }) => {
//     await delay(300);
//     const body = (await request.json()) as { title?: string };
//     const id = nextId();
//     const now = new Date().toISOString();
//     presentations.unshift({
//       projectId: id,
//       title: body.title || '새 프레젠테이션',
//       slideCount: 0,
//       feedbackCount: 0,
//       durationSeconds: 0,
//       createdAt: now,
//       updatedAt: now,
//     });
//     return ok({ projectId: id, title: body.title || '새 프레젠테이션', updatedAt: now });
//   }),

//   // 단일 프로젝트 조회
//   http.get(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
//     await delay(150);
//     const { projectId } = params as { projectId: string };
//     const project = presentations.find((p) => p.projectId === projectId);
//     if (!project) return fail(404, 'P001', '프로젝트를 찾을 수 없습니다.');
//     return ok(project);
//   }),

//   // 수정
//   http.patch(`${BASE_URL}/presentations/:projectId`, async ({ params, request }) => {
//     await delay(150);
//     const { projectId } = params as { projectId: string };
//     const body = (await request.json()) as { title?: string };
//     const target = presentations.find((p) => p.projectId === projectId);
//     if (!target) return fail(404, 'P001', '프로젝트를 찾을 수 없습니다.');

//     if (body.title) target.title = body.title;
//     target.updatedAt = new Date().toISOString();
//     return ok({ projectId, title: target.title, updatedAt: target.updatedAt });
//   }),

//   // 삭제
//   http.delete(`${BASE_URL}/presentations/:projectId`, async ({ params }) => {
//     await delay(150);
//     const { projectId } = params as { projectId: string };
//     presentations = presentations.filter((p) => p.projectId !== projectId);
//     slides = slides.filter((s) => s.projectId !== projectId);
//     return ok({ message: '프로젝트가 성공적으로 삭제되었습니다.' });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  SLIDES — /presentations/:projectId/slides, /presentations/slides/:slideId
// // ═══════════════════════════════════════════════════════════════

// const slideHandlers = [
//   // 프로젝트별 슬라이드 목록
//   http.get(`${BASE_URL}/presentations/:projectId/slides`, async ({ params }) => {
//     await delay(200);
//     const { projectId } = params as { projectId: string };
//     const projectSlides = slides
//       .filter((s) => s.projectId === projectId)
//       .sort((a, b) => a.slideNum - b.slideNum);
//     return ok(projectSlides);
//   }),

//   // 단일 슬라이드 조회 (prevSlideId, nextSlideId 포함)
//   http.get(`${BASE_URL}/presentations/slides/:slideId`, async ({ params }) => {
//     await delay(150);
//     const { slideId } = params as { slideId: string };
//     const slide = slides.find((s) => s.slideId === slideId);
//     if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

//     const siblings = slides
//       .filter((s) => s.projectId === slide.projectId)
//       .sort((a, b) => a.slideNum - b.slideNum);
//     const idx = siblings.findIndex((s) => s.slideId === slideId);

//     return ok({
//       slideId: slide.slideId,
//       projectId: slide.projectId,
//       title: slide.title,
//       slideNum: slide.slideNum,
//       imageUrl: slide.imageUrl,
//       prevSlideId: idx > 0 ? siblings[idx - 1].slideId : null,
//       nextSlideId: idx < siblings.length - 1 ? siblings[idx + 1].slideId : null,
//       updatedAt: slide.updatedAt,
//     });
//   }),

//   // 슬라이드 수정 (제목)
//   http.patch(`${BASE_URL}/presentations/slides/:slideId`, async ({ params, request }) => {
//     await delay(150);
//     const { slideId } = params as { slideId: string };
//     const body = (await request.json()) as { title?: string };
//     const slide = slides.find((s) => s.slideId === slideId);
//     if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

//     if (body.title) slide.title = body.title;
//     slide.updatedAt = new Date().toISOString();
//     return ok({
//       slideId: slide.slideId,
//       title: slide.title,
//       slideNum: slide.slideNum,
//       imageUrl: slide.imageUrl,
//       updatedAt: slide.updatedAt,
//     });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  SCRIPTS — /presentations/slides/:slideId/script, /versions, /restore
// // ═══════════════════════════════════════════════════════════════

// const scriptHandlers = [
//   // 스크립트 조회
//   http.get(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params }) => {
//     await delay(100);
//     const { slideId } = params as { slideId: string };
//     const slide = slides.find((s) => s.slideId === slideId);
//     if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

//     const text = slide.script ?? '';
//     return ok({
//       message: '대본이 성공적으로 조회되었습니다.',
//       slideId,
//       charCount: text.length,
//       scriptText: text,
//       estimatedDurationSeconds: Math.ceil(text.length / 5),
//       createdAt: slide.createdAt,
//       updatedAt: slide.updatedAt,
//     });
//   }),

//   // 스크립트 저장
//   http.patch(`${BASE_URL}/presentations/slides/:slideId/script`, async ({ params, request }) => {
//     await delay(150);
//     const { slideId } = params as { slideId: string };
//     const body = (await request.json()) as { script?: string };
//     const slide = slides.find((s) => s.slideId === slideId);
//     if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

//     const text = body.script ?? '';
//     if (slide.script === text) {
//       return ok({
//         message: '변경사항이 없어 저장되지 않았습니다.',
//         slideId,
//         charCount: text.length,
//         scriptText: text,
//         estimatedDurationSeconds: Math.ceil(text.length / 5),
//         createdAt: slide.createdAt,
//         updatedAt: slide.updatedAt,
//       });
//     }

//     slide.script = text;
//     slide.updatedAt = new Date().toISOString();

//     // 버전 추가
//     const versions = scriptVersions.get(slideId) ?? [];
//     const nextVer =
//       versions.length > 0
//         ? Math.max(...versions.map((v: { versionNumber: number }) => v.versionNumber)) + 1
//         : 1;
//     versions.push({
//       versionNumber: nextVer,
//       scriptText: text,
//       charCount: text.length,
//       createdAt: slide.updatedAt,
//     });
//     scriptVersions.set(slideId, versions);

//     return ok({
//       message: '대본이 성공적으로 저장되었습니다',
//       slideId,
//       charCount: text.length,
//       scriptText: text,
//       estimatedDurationSeconds: Math.ceil(text.length / 5),
//       createdAt: slide.createdAt,
//       updatedAt: slide.updatedAt,
//     });
//   }),

//   // 버전 목록
//   http.get(`${BASE_URL}/presentations/slides/:slideId/versions`, async ({ params }) => {
//     await delay(100);
//     const { slideId } = params as { slideId: string };
//     return ok(scriptVersions.get(slideId) ?? []);
//   }),

//   // 버전 복원
//   http.post(`${BASE_URL}/presentations/slides/:slideId/restore`, async ({ params, request }) => {
//     await delay(200);
//     const { slideId } = params as { slideId: string };
//     const body = (await request.json()) as { version: number };
//     const versions = scriptVersions.get(slideId) ?? [];
//     const target = versions.find(
//       (v: { versionNumber: number }) => v.versionNumber === body.version,
//     );
//     if (!target) return fail(404, 'SC001', '해당 버전을 찾을 수 없습니다.');

//     const slide = slides.find((s) => s.slideId === slideId);
//     if (!slide) return fail(404, 'S001', '슬라이드를 찾을 수 없습니다.');

//     slide.script = target.scriptText;
//     slide.updatedAt = new Date().toISOString();

//     return ok({
//       message: '대본이 성공적으로 저장되었습니다',
//       slideId,
//       charCount: target.charCount,
//       scriptText: target.scriptText,
//       estimatedDurationSeconds: Math.ceil(target.charCount / 5),
//       createdAt: slide.createdAt,
//       updatedAt: slide.updatedAt,
//     });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  COMMENTS — /slides/:slideId/comments, /comments/:commentId/*
// // ═══════════════════════════════════════════════════════════════

// const commentHandlers = [
//   // 슬라이드 댓글 목록 (페이지네이션)
//   http.get(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
//     await delay(150);
//     const { slideId } = params as { slideId: string };
//     const url = new URL(request.url);
//     const page = Number(url.searchParams.get('page') ?? '1');
//     const limit = Number(url.searchParams.get('limit') ?? '20');

//     const all = [...(slideComments.get(slideId) ?? [])].sort((a, b) =>
//       a.createdAt.localeCompare(b.createdAt),
//     );
//     const total = all.length;
//     const start = (page - 1) * limit;
//     const paged = all.slice(start, start + limit);

//     return ok({
//       comments: paged.map((c) => {
//         const user = MOCK_USERS.find((u) => u.id === c.userId) ?? MOCK_CURRENT_USER;
//         return {
//           commentId: c.commentId,
//           content: c.content,
//           user: { userId: c.userId, nickName: user.name },
//           createdAt: c.createdAt,
//           updatedAt: c.updatedAt,
//         };
//       }),
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   }),

//   // 슬라이드 댓글 작성
//   http.post(`${BASE_URL}/slides/:slideId/comments`, async ({ params, request }) => {
//     await delay(200);
//     const { slideId } = params as { slideId: string };
//     const body = (await request.json()) as { content: string };
//     const commentId = nextId();
//     const now = new Date().toISOString();
//     const comment: StoredComment = {
//       commentId,
//       content: body.content,
//       userId: MOCK_CURRENT_USER.id,
//       slideId,
//       createdAt: now,
//       updatedAt: now,
//     };
//     const arr = slideComments.get(slideId) ?? [];
//     arr.push(comment);
//     slideComments.set(slideId, arr);

//     return ok({
//       commentId: commentId,
//       content: body.content,
//       userId: MOCK_CURRENT_USER.id,
//       createdAt: now,
//     });
//   }),

//   // 답글 작성
//   http.post(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
//     await delay(200);
//     const { commentId: parentId } = params as { commentId: string };
//     const body = (await request.json()) as { content: string };

//     // 부모 댓글의 slideId 탐색 (slideComments → commentReplies 순)
//     let parentSlideId = '';
//     for (const [sid, comments] of slideComments) {
//       if (comments.some((c) => c.commentId === parentId)) {
//         parentSlideId = sid;
//         break;
//       }
//     }
//     if (!parentSlideId) {
//       for (const replies of commentReplies.values()) {
//         const found = replies.find((r) => r.commentId === parentId);
//         if (found) {
//           parentSlideId = found.slideId;
//           break;
//         }
//       }
//     }
//     // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 허용
//     if (!parentSlideId) parentSlideId = 'unknown';

//     const newCommentId = nextId();
//     const now = new Date().toISOString();
//     const reply: StoredComment = {
//       commentId: newCommentId,
//       content: body.content,
//       parentId: parentId,
//       userId: MOCK_CURRENT_USER.id,
//       slideId: parentSlideId,
//       createdAt: now,
//       updatedAt: now,
//     };
//     const arr = commentReplies.get(parentId) ?? [];
//     arr.push(reply);
//     commentReplies.set(parentId, arr);

//     return ok({
//       parentCommentId: parentId,
//       replyId: newCommentId,
//       content: body.content,
//       userId: MOCK_CURRENT_USER.id,
//       createdAt: now,
//     });
//   }),

//   // 답글 목록
//   http.get(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
//     await delay(100);
//     const { commentId } = params as { commentId: string };
//     const url = new URL(request.url);
//     const page = Number(url.searchParams.get('page') ?? '1');
//     const limit = Number(url.searchParams.get('limit') ?? '20');

//     const all = [...(commentReplies.get(commentId) ?? [])].sort((a, b) =>
//       a.createdAt.localeCompare(b.createdAt),
//     );
//     const total = all.length;
//     const start = (page - 1) * limit;
//     const paged = all.slice(start, start + limit);

//     return ok({
//       comments: paged.map((r) => {
//         const user = MOCK_USERS.find((u) => u.id === r.userId) ?? MOCK_CURRENT_USER;
//         return {
//           commentId: r.commentId,
//           content: r.content,
//           user: { userId: r.userId, nickName: user.name },
//           createdAt: r.createdAt,
//           updatedAt: r.updatedAt,
//         };
//       }),
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   }),

//   // 댓글 수정
//   http.patch(`${BASE_URL}/comments/:commentId`, async ({ params, request }) => {
//     await delay(150);
//     const { commentId } = params as { commentId: string };
//     const body = (await request.json()) as { content: string };

//     // slideComments에서 검색
//     for (const comments of slideComments.values()) {
//       const c = comments.find((c) => c.commentId === commentId);
//       if (c) {
//         c.content = body.content;
//         c.updatedAt = new Date().toISOString();
//         return ok({
//           updatedTargetType: 'comment',
//           commentId,
//           content: c.content,
//           userId: c.userId,
//           createdAt: c.createdAt,
//           updatedAt: c.updatedAt,
//         });
//       }
//     }
//     // commentReplies에서 검색
//     for (const replies of commentReplies.values()) {
//       const r = replies.find((r) => r.commentId === commentId);
//       if (r) {
//         r.content = body.content;
//         r.updatedAt = new Date().toISOString();
//         return ok({
//           updatedTargetType: 'reply',
//           replyId: commentId,
//           parentCommentId: r.parentId,
//           content: r.content,
//           userId: r.userId,
//           createdAt: r.createdAt,
//           updatedAt: r.updatedAt,
//         });
//       }
//     }
//     // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 성공 처리
//     const now = new Date().toISOString();
//     return ok({
//       updatedTargetType: 'comment',
//       commentId,
//       content: body.content,
//       userId: MOCK_CURRENT_USER.id,
//       createdAt: now,
//       updatedAt: now,
//     });
//   }),

//   // 댓글 삭제
//   http.delete(`${BASE_URL}/comments/:commentId`, async ({ params }) => {
//     await delay(150);
//     const { commentId } = params as { commentId: string };

//     // slideComments에서 삭제
//     for (const [sid, comments] of slideComments) {
//       const idx = comments.findIndex((c) => c.commentId === commentId);
//       if (idx !== -1) {
//         comments.splice(idx, 1);
//         slideComments.set(sid, comments);
//         commentReplies.delete(commentId);
//         return ok({ deletedTargetType: 'comment', commentId });
//       }
//     }
//     // commentReplies에서 삭제
//     for (const [pid, replies] of commentReplies) {
//       const idx = replies.findIndex((r) => r.commentId === commentId);
//       if (idx !== -1) {
//         replies.splice(idx, 1);
//         commentReplies.set(pid, replies);
//         return ok({ deletedTargetType: 'reply', replyId: commentId, parentCommentId: pid });
//       }
//     }
//     // 옵티미스틱 UI에서 생성된 UUID로 요청할 수 있으므로, 못 찾아도 성공 처리
//     return ok({ deletedTargetType: 'comment', commentId });
//   }),

//   // 영상 댓글 작성
//   http.post(`${BASE_URL}/videos/:videoId/comments`, async ({ params, request }) => {
//     await delay(200);
//     const { videoId } = params as { videoId: string };
//     const body = (await request.json()) as { content: string; timestampMs: number };
//     const commentId = nextId();
//     const now = new Date().toISOString();
//     const comment: StoredVideoComment = {
//       commentId,
//       content: body.content,
//       timestampMs: body.timestampMs,
//       userId: MOCK_CURRENT_USER.id,
//       userName: MOCK_CURRENT_USER.name ?? '사용자',
//       createdAt: now,
//     };
//     const arr = videoComments.get(videoId) ?? [];
//     arr.push(comment);
//     videoComments.set(videoId, arr);
//     return ok({ commentId, content: body.content, timestampMs: body.timestampMs, createdAt: now });
//   }),

//   // 영상 댓글 조회 (타임스탬프 기준)
//   http.get(`${BASE_URL}/videos/:videoId/comments`, async ({ params, request }) => {
//     await delay(100);
//     const { videoId } = params as { videoId: string };
//     const url = new URL(request.url);
//     const timestamp = Number(url.searchParams.get('timestamp') ?? '0');
//     const windowMs = 5000;
//     const all = videoComments.get(videoId) ?? [];
//     const filtered = all.filter(
//       (c) => c.timestampMs >= timestamp - windowMs && c.timestampMs <= timestamp + windowMs,
//     );
//     return ok({
//       comments: filtered.map((c) => ({
//         commentId: c.commentId,
//         content: c.content,
//         timestampMs: c.timestampMs,
//         user: { userId: c.userId, nickName: c.userName },
//         createdAt: c.createdAt,
//       })),
//     });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  REACTIONS — /slides/:slideId/reactions/*, /videos/:videoId/reactions/*
// // ═══════════════════════════════════════════════════════════════

// const reactionHandlers = [
//   // 슬라이드 리액션 생성 (요청 1회 = 카운트 1 증가)
//   http.post(`${BASE_URL}/slides/:slideId/reactions`, async ({ params, request }) => {
//     await delay(100);
//     const { slideId } = params as { slideId: string };
//     const body = (await request.json()) as { emojiType: string };
//     const reactions = slideReactions.get(slideId) ?? {};
//     reactions[body.emojiType] = (reactions[body.emojiType] ?? 0) + 1;
//     slideReactions.set(slideId, reactions);
//     return ok({
//       reactionId: String(Date.now()),
//       slideId,
//       emojiType: body.emojiType,
//       createdAt: new Date().toISOString(),
//     });
//   }),

//   // 슬라이드 리액션 요약
//   http.get(`${BASE_URL}/slides/:slideId/reactions/summary`, async ({ params }) => {
//     await delay(100);
//     const { slideId } = params as { slideId: string };
//     const reactions = slideReactions.get(slideId) ?? {};
//     const filled = {
//       fire: reactions.fire ?? 0,
//       good: reactions.good ?? 0,
//       bad: reactions.bad ?? 0,
//       sleepy: reactions.sleepy ?? 0,
//       confused: reactions.confused ?? 0,
//     };
//     return ok({ slideId, reactions: filled });
//   }),

//   // 프로젝트 슬라이드 리액션 총합
//   http.get(`${BASE_URL}/presentations/:projectId/slides/reactions/summary`, async ({ params }) => {
//     await delay(100);
//     const { projectId } = params as { projectId: string };
//     const projectSlides = slides.filter((s) => s.projectId === projectId);
//     const total: Record<string, number> = {
//       fire: 0,
//       good: 0,
//       bad: 0,
//       sleepy: 0,
//       confused: 0,
//     };
//     let totalCount = 0;
//     projectSlides.forEach((s) => {
//       const r = slideReactions.get(s.slideId) ?? {};
//       Object.entries(r).forEach(([type, count]) => {
//         total[type] = (total[type] ?? 0) + count;
//         totalCount += count;
//       });
//     });
//     return ok({ projectId, totalReactions: total, totalCount });
//   }),

//   // 영상 리액션 토글
//   http.post(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
//     await delay(100);
//     const { videoId } = params as { videoId: string };
//     await request.json();
//     return ok({ reactionId: nextId(), videoId, active: true });
//   }),

//   // 영상 리액션 타임라인
//   http.get(`${BASE_URL}/videos/:videoId/reactions/timeline`, async ({ params, request }) => {
//     await delay(100);
//     const { videoId } = params as { videoId: string };
//     const url = new URL(request.url);
//     const intervalMs = Number(url.searchParams.get('intervalMs') ?? '5000');

//     // mock 타임라인에서 마커 생성
//     const markers: { timestampMs: number; emojiType: string; count: number }[] = [];
//     const timeline = mockTimelines[videoId];

//     if (timeline) {
//       timeline.reactions.forEach((r) => {
//         const bucket = Math.floor(r.timestampMs / intervalMs) * intervalMs;
//         markers.push({ timestampMs: bucket, emojiType: r.emojiType, count: r.count });
//       });
//     }

//     return ok({ intervalMs, markers });
//   }),

//   // 영상 리액션 (특정 시점)
//   http.get(`${BASE_URL}/videos/:videoId/reactions`, async ({ params, request }) => {
//     await delay(100);
//     const { videoId } = params as { videoId: string };
//     const url = new URL(request.url);
//     const timestampMs = Number(url.searchParams.get('timestampMs') ?? '0');
//     const windowMs = Number(url.searchParams.get('windowMs') ?? '2000');

//     const result: { emojiType: string; count: number }[] = [];
//     const timeline = mockTimelines[videoId];

//     if (timeline) {
//       const totals: Record<string, number> = {};
//       timeline.reactions.forEach((r) => {
//         if (r.timestampMs >= timestampMs - windowMs && r.timestampMs <= timestampMs + windowMs) {
//           totals[r.emojiType] = (totals[r.emojiType] ?? 0) + r.count;
//         }
//       });
//       Object.entries(totals).forEach(([type, count]) => result.push({ emojiType: type, count }));
//     }

//     return ok(result);
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  VIDEOS — /videos/*, /presentations/:projectId/videos
// // ═══════════════════════════════════════════════════════════════

// const videoHandlers = [
//   //   // POST /videos/start - 영상 녹화 세션 생성
//   //   http.post(`${BASE_URL}/videos/start`, async ({ request }) => {
//   //     await delay(200);
//   //     await request.json();
//   //     const videoId = String(Date.now());

//   //     return HttpResponse.json<ApiResponse<CreateStartVideoResponseDto>>({
//   //       resultType: 'SUCCESS',
//   //       success: {
//   //         videoId,
//   //       },
//   //       error: null,
//   //     });
//   //   }),

//   //   // POST /videos/:videoId/chunks/:chunkIndex - 청크 업로드
//   //   http.post(`${BASE_URL}/videos/:videoId/chunks/:chunkIndex`, async ({ params }) => {
//   //     await delay(100);
//   //     const { videoId, chunkIndex } = params;

//   //     console.log(`[MSW] Chunk ${chunkIndex} uploaded for video ${videoId}`);

//   //     return HttpResponse.json<ApiResponse<CreateChunkUploadResponseDto>>({
//   //       resultType: 'SUCCESS',
//   //       success: {
//   //         ok: true,
//   //       },
//   //       error: null,
//   //     });
//   //   }),

//   //   // POST /videos/:videoId/finish - 녹화 종료
//   //   http.post(`${BASE_URL}/videos/:videoId/finish`, async ({ params, request }) => {
//   //     await delay(300);
//   //     const { videoId } = params;
//   //     const body = (await request.json()) as CreateFinishVideoRequestDto;

//   //     return HttpResponse.json<ApiResponse<CreateFinishVideoResponseDto>>({
//   //       resultType: 'SUCCESS',
//   //       success: {
//   //         videoId: String(videoId),
//   //         status: 'processing',
//   //         slideCount: body.slideLogs.length,
//   //         slideDurations: body.slideLogs.map((log) => ({
//   //           slideId: String(log.slideId),
//   //           totalDurationMs: log.timestampMs,
//   //         })),
//   //       },
//   //       error: null,
//   //     });
//   //   }),

//   //GET /presentations/:projectId/videos - 프로젝트별 영상 목록 조회
//   http.get(`${BASE_URL}/presentations/:projectId/videos`, async ({ request }) => {
//     await delay(200);
//     const url = new URL(request.url);
//     const search = url.searchParams.get('search') || '';
//     const filter = url.searchParams.get('filter') || '';
//     const sort = url.searchParams.get('sort') || 'recent';

//     // 필터링 & 정렬
//     let videos = mockVideoList;
//     videos = filterVideosBySearch(videos, search);
//     videos = filterVideosByStatus(videos, filter);
//     videos = sortVideos(videos, sort);

//     return HttpResponse.json<ApiResponse<ReadProjectVideosResponseDto>>({
//       resultType: 'SUCCESS',
//       success: {
//         videos,
//         total: videos.length,
//       },
//       error: null,
//     });
//   }),

//   // GET /videos/:videoId - 영상 상세 조회
//   http.get(`${BASE_URL}/videos/:videoId`, async ({ params }) => {
//     await delay(200);
//     const { videoId } = params;
//     const video = mockVideoDetails[String(videoId)];
//     const timeline = mockTimelines[String(videoId)];

//     if (!video) {
//       return HttpResponse.json<ApiResponse<ReadVideoDetailResponseDto>>(
//         {
//           resultType: 'FAILURE',
//           error: {
//             errorCode: 'VIDEO_NOT_FOUND',
//             reason: '영상을 찾을 수 없습니다.',
//             data: null,
//           },
//           success: null,
//         },
//         { status: 404 },
//       );
//     }

//     return HttpResponse.json<ApiResponse<ReadVideoDetailResponseDto>>({
//       resultType: 'SUCCESS',
//       success: {
//         video,
//         timeline: timeline || { reactions: [], comments: [] },
//       },
//       error: null,
//     });
//   }),

//   // GET /videos/:videoId/slides - 슬라이드 타임라인 조회
//   http.get(`${BASE_URL}/videos/:videoId/slides`, async ({ params }) => {
//     await delay(150);
//     const { videoId } = params;
//     const slides = mockSlideTimelines[String(videoId)];

//     if (!slides) {
//       return HttpResponse.json<ApiResponse<ReadVideoSlidesResponseDto>>(
//         {
//           resultType: 'FAILURE',
//           error: {
//             errorCode: 'VIDEO_NOT_FOUND',
//             reason: '영상을 찾을 수 없습니다.',
//             data: null,
//           },
//           success: null,
//         },
//         { status: 404 },
//       );
//     }

//     return HttpResponse.json<ApiResponse<ReadVideoSlidesResponseDto>>({
//       resultType: 'SUCCESS',
//       success: {
//         slides,
//       },
//       error: null,
//     });
//   }),

//   //   // POST /videos/:videoId/comments - 댓글 작성
//   //   http.post(`${BASE_URL}/videos/:videoId/comments`, async ({ request }) => {
//   //     await delay(200);
//   //     const body = (await request.json()) as CreateCommentRequestDto & { timestampMs?: number };

//   //     return HttpResponse.json<ApiResponse<CreateCommentResponseDto>>({
//   //       resultType: 'SUCCESS',
//   //       success: {
//   //         commentId: `c${Date.now()}`,
//   //         content: body.content,
//   //         createdAt: new Date().toISOString(),
//   //         userId: MOCK_CURRENT_USER.id,
//   //       },
//   //       error: null,
//   //     });
//   //   }),

//   //   // POST /comments/:commentId/replies - 답글 작성
//   //   http.post(`${BASE_URL}/comments/:commentId/replies`, async ({ params, request }) => {
//   //     await delay(200);
//   //     const { commentId } = params;
//   //     const body = (await request.json()) as CreateCommentRequestDto;

//   //     return HttpResponse.json<ApiResponse<CreateReplyCommentResponseDto>>({
//   //       resultType: 'SUCCESS',
//   //       success: {
//   //         replyId: `r${Date.now()}`,
//   //         content: body.content,
//   //         createdAt: new Date().toISOString(),
//   //         userId: MOCK_CURRENT_USER.id,
//   //         parentCommentId: String(commentId),
//   //       },
//   //       error: null,
//   //     });
//   //   }),

//   //   // DELETE /comments/:commentId - 댓글 삭제
//   //   http.delete(`${BASE_URL}/comments/:commentId`, async () => {
//   //     await delay(150);
//   //     return HttpResponse.json<ApiResponse<null>>({
//   //       resultType: 'SUCCESS',
//   //       success: null,
//   //       error: null,
//   //     });
//   //   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  SHARES — /presentations/:projectId/shares, /shares/:shareToken
// // ═══════════════════════════════════════════════════════════════

// const shareHandlers = [
//   // 공유 링크 생성
//   http.post(`${BASE_URL}/presentations/:projectId/shares`, async ({ params, request }) => {
//     await delay(200);
//     const { projectId } = params as { projectId: string };
//     const body = (await request.json()) as {
//       scope: string;
//       videoId?: string;
//       expiredAt?: string;
//     };
//     const shareToken = crypto.randomUUID();
//     const now = new Date().toISOString();
//     const project = presentations.find((p) => p.projectId === projectId);

//     shareLinks.set(shareToken, {
//       shareToken,
//       projectId,
//       scope: body.scope,
//       videoId: body.videoId,
//       viewCount: 0,
//       createdAt: now,
//     });

//     return ok({
//       projectId,
//       scope: body.scope,
//       shareToken,
//       shareUrl: `${window.location.origin}/shares/${shareToken}`,
//       sharedContentSummary: {
//         scope: body.scope,
//         projectTitle: project?.title ?? '',
//         videoTitle: body.videoId ? mockVideoDetails[body.videoId]?.title : null,
//         videoCreatedAt: body.videoId ? now : null,
//         thumbnailUrl: project?.thumbnailUrl ?? null,
//       },
//       createdAt: now,
//     });
//   }),

//   // 공유 콘텐츠 조회 (인증 불필요)
//   http.get(`${BASE_URL}/shares/:shareToken`, async ({ params }) => {
//     await delay(200);
//     const { shareToken } = params as { shareToken: string };
//     const link = shareLinks.get(shareToken);
//     if (!link) return fail(404, 'SH001', '공유 링크를 찾을 수 없습니다.');

//     link.viewCount++;
//     const project = presentations.find((p) => p.projectId === link.projectId);
//     const projectSlides = slides
//       .filter((s) => s.projectId === link.projectId)
//       .sort((a, b) => a.slideNum - b.slideNum);

//     const videoDetail = link.videoId ? mockVideoDetails[link.videoId] : null;
//     const videoSlideTimeline = link.videoId ? (mockSlideTimelines[link.videoId] ?? []) : [];
//     const slideTimestampMap = new Map(
//       videoSlideTimeline.map((slide) => [String(slide.slideId), slide.timestampMs]),
//     );
//     const sharedComments = link.videoId
//       ? (videoComments.get(link.videoId) ?? []).map((comment) => ({
//           commentId: comment.commentId,
//           content: comment.content,
//           writer: comment.userName,
//           targetType: 'video' as const,
//           targetId: link.videoId ?? '',
//           timestampMs: comment.timestampMs,
//           createdAt: comment.createdAt,
//         }))
//       : [];

//     return ok({
//       message: '공유된 프로젝트에 접속했습니다.',
//       sessionInfo: {
//         sessionId: crypto.randomUUID(),
//         tokens: {
//           accessToken: `mock-share-access-${shareToken}`,
//           refreshToken: `mock-share-refresh-${shareToken}`,
//         },
//       },
//       shareInfo: { shareToken, scope: link.scope, createdAt: link.createdAt },
//       projectContent: {
//         title: project?.title ?? '',
//         slides: projectSlides.map((s) => ({
//           slideId: s.slideId,
//           slideNum: s.slideNum,
//           imageUrl: s.imageUrl,
//           scriptText: s.script ?? '',
//           timestampMs: slideTimestampMap.get(String(s.slideId)),
//         })),
//         video:
//           link.scope === 'slides_script_video' && videoDetail
//             ? {
//                 videoId: videoDetail.videoId,
//                 videoUrl: videoDetail.hlsMasterUrl,
//                 thumbnailUrl: videoDetail.thumbnailUrl,
//               }
//             : null,
//         comments: sharedComments,
//       },
//     });
//   }),

//   // 공유 링크 목록
//   http.get(`${BASE_URL}/presentations/:projectId/shares`, async ({ params }) => {
//     await delay(100);
//     const { projectId } = params as { projectId: string };
//     const links: StoredShareLink[] = [];
//     for (const link of shareLinks.values()) {
//       if (link.projectId === projectId) links.push(link);
//     }
//     return ok(
//       links.map((l) => ({
//         scope: l.scope,
//         shareToken: l.shareToken,
//         isActive: true,
//         viewCount: l.viewCount,
//         videoTitle: l.videoId ? mockVideoDetails[l.videoId]?.title : null,
//         createdAt: l.createdAt,
//       })),
//     );
//   }),

//   // 공유용 영상 목록
//   http.get(`${BASE_URL}/presentations/:projectId/shares/videos`, async ({ request }) => {
//     await delay(100);
//     const url = new URL(request.url);
//     const page = Number(url.searchParams.get('page') ?? '1');
//     const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

//     const allVideos = mockVideoList.map((v) => ({
//       id: v.videoId,
//       title: v.title,
//       thumbnailUrl: v.thumbnailUrl,
//       createdAt: v.createdAt,
//     }));

//     const start = (page - 1) * pageSize;
//     const paged = allVideos.slice(start, start + pageSize);

// // ═══════════════════════════════════════════════════════════════
// //  FILES — /files/upload
// // ═══════════════════════════════════════════════════════════════

// const fileHandlers = [
//   http.post(`${BASE_URL}/files/upload`, async () => {
//     await delay(500);
//     const id = nextId();
//     // 파일 업로드 시 프로젝트 자동 생성
//     const now = new Date().toISOString();
//     presentations.unshift({
//       projectId: id,
//       title: '업로드된 프레젠테이션',
//       slideCount: 5,
//       feedbackCount: 0,
//       durationSeconds: 0,
//       createdAt: now,
//       updatedAt: now,
//     });
//     return ok({ projectId: id });
//   }),

//   // 변환 상태 조회
//   http.get(`${BASE_URL}/presentations/:projectId/status`, async () => {
//     await delay(100);
//     return ok({ status: 'completed', progress: 100 });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  ANALYTICS — /presentations/:projectId/analytics/*, /analytics/*
// // ═══════════════════════════════════════════════════════════════

// const analyticsHandlers = [
//   // 프로젝트 요약
//   http.get(`${BASE_URL}/presentations/:projectId/analytics/summary`, async ({ params }) => {
//     await delay(150);
//     const { projectId } = params as { projectId: string };
//     return ok(getMockProjectAnalyticsSummary(projectId));
//   }),

//   // 슬라이드별 분석
//   http.get(`${BASE_URL}/presentations/:projectId/analytics/slides`, async ({ params }) => {
//     await delay(150);
//     const { projectId } = params as { projectId: string };
//     return ok(getMockSlideAnalytics(projectId));
//   }),

//   // 영상 이탈 분석
//   http.get(`${BASE_URL}/videos/:videoId/analytics/exits`, async ({ params }) => {
//     await delay(150);
//     const { videoId } = params as { videoId: string };
//     return ok(getMockVideoExitAnalytics(videoId));
//   }),

//   // 영상 타임라인 분석
//   http.get(`${BASE_URL}/videos/:videoId/analytics/timeline`, async ({ params }) => {
//     await delay(100);
//     const { videoId } = params as { videoId: string };
//     const timeline = mockTimelines[videoId];

//     const result = [];
//     if (timeline) {
//       // 30초 간격으로 데이터 생성
//       const duration = mockVideoDetails[videoId]?.durationSeconds || 600;
//       for (let t = 0; t <= duration * 1000; t += 30000) {
//         const reactionsInWindow = timeline.reactions.filter(
//           (r) => r.timestampMs >= t - 15000 && r.timestampMs < t + 15000,
//         );
//         const commentsInWindow = timeline.comments.filter(
//           (c) => c.timestampMs >= t - 15000 && c.timestampMs < t + 15000,
//         );

//         result.push({
//           timestampMs: t,
//           reactionCount: reactionsInWindow.reduce((sum, r) => sum + r.count, 0),
//           commentCount: commentsInWindow.length,
//           feedbackCount:
//             reactionsInWindow.reduce((sum, r) => sum + r.count, 0) + commentsInWindow.length,
//         });
//       }
//     }

//     return ok({ timeline: result });
//   }),

//   // 페이지뷰 기록
//   http.post(`${BASE_URL}/analytics/pageview`, async () => {
//     await delay(50);
//     return ok({ ok: true });
//   }),

//   // 슬라이드 조회 기록
//   http.post(`${BASE_URL}/analytics/slide-view`, async () => {
//     await delay(50);
//     return ok({ ok: true });
//   }),

//   // 영상 이벤트 기록
//   http.post(`${BASE_URL}/analytics/video-event`, async () => {
//     await delay(50);
//     return ok({ ok: true });
//   }),

//   // 이탈 기록
//   http.post(`${BASE_URL}/analytics/exit`, async () => {
//     await delay(50);
//     return ok({ ok: true });
//   }),
// ];

// // ═══════════════════════════════════════════════════════════════
// //  EXPORT
// // ═══════════════════════════════════════════════════════════════

// export const handlers = [
//   ...authHandlers,
//   ...sessionHandlers,
//   ...projectHandlers,
//   ...slideHandlers,
//   ...scriptHandlers,
//   ...commentHandlers,
//   ...reactionHandlers,
//   ...videoHandlers,
//   ...shareHandlers,
//   ...fileHandlers,
//   ...analyticsHandlers,
// ];
