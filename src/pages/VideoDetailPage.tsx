// import { useCallback, useEffect, useRef, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// import { videosApi, createVideoComment, createCommentReply, deleteVideoComment } from '@/api/endpoints/videos';
// import { updateComment } from '@/api/endpoints/comments';
// import type { GetVideoDetailResponseDto } from '@/api/dto/video.dto';
// import { CommentInput } from '@/components/comment';
// import CommentList from '@/components/comment/CommentList';
// import FeedbackMobileLayout from '@/components/feedback/FeedbackMobileLayout';
// import ScriptSection from '@/components/feedback/ScriptSection';
// import SlideWebcamStage from '@/components/feedback/video/SlideWebcamStage';
// import { useIsDesktop } from '@/hooks/useMediaQuery';
// import { useAuthStore } from '@/stores/authStore';

// interface Comment {
//   id: string;
//   content: string;
//   timestamp: number;
//   createdAt: string;
//   author: string;
//   userId: string;
//   replies: Array<{
//     id: string;
//     content: string;
//     createdAt: string;
//     author: string;
//     userId: string;
//   }>;
// }

// export default function VideoDetailPage() {
//   const { projectId, videoId } = useParams<{ projectId: string; videoId: string }>();
//   const navigate = useNavigate();
//   const isDesktop = useIsDesktop();
//   const currentUser = useAuthStore((state) => state.user);

//   // 비디오 데이터
//   const [videoData, setVideoData] = useState<GetVideoDetailResponseDto | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // 재생 상태
//   const [currentTime, setCurrentTime] = useState(0);

//   // 댓글 상태
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [commentDraft, setCommentDraft] = useState('');

//   // 슬라이드 데이터
//   const [projectSlides, setProjectSlides] = useState<unknown[]>([]);
//   const [slideChangeTimes, setSlideChangeTimes] = useState<number[]>([]);

//   // 비디오 위치 계산을 위한 refs
//   const desktopPlaceholderRef = useRef<HTMLDivElement>(null);
//   const mobilePlaceholderRef = useRef<HTMLDivElement>(null);
//   const [videoStyle, setVideoStyle] = useState<React.CSSProperties>({
//     position: 'fixed',
//     opacity: 0,
//   });

//   // 비디오 데이터 로드
//   useEffect(() => {
//     const loadVideoDetail = async () => {
//       if (!videoId) return;

//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await videosApi.getVideoDetail(videoId);

//         if (response.data.resultType === 'FAILURE') {
//           throw new Error(response.data.error?.reason || '영상을 불러올 수 없습니다');
//         }

//         const data = response.data.success!;
//         setVideoData(data);

//         // 댓글 데이터 변환
//         const transformedComments: Comment[] = (data.timeline?.comments ?? []).map((comment) => ({
//         id: comment.commentId,
//         content: comment.content,
//         timestamp: comment.timestampMs / 1000,
//         createdAt: comment.createdAt,
//         author: comment.user.name,
//         userId: comment.user.userId,
//         replies:
//           comment.replies?.map((reply) => ({
//             id: reply.replyId,
//             content: reply.content,
//             createdAt: reply.createdAt,
//             author: reply.user.name,
//             userId: reply.user.userId,
//           })) ?? [],
//       }));

//         setComments(transformedComments);

//         // TODO: 슬라이드 데이터 로드
//         // const slidesResponse = await videosApi.getVideoSlides(videoId);
//       } catch (err) {
//         const errorMessage = err instanceof Error ? err.message : '영상 로드 실패';
//         setError(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadVideoDetail();
//   }, [videoId]);

//   // 비디오 위치 업데이트
//   useEffect(() => {
//     const updateVideoPosition = () => {
//       const primaryRef = isDesktop ? desktopPlaceholderRef : mobilePlaceholderRef;
//       const fallbackRef = isDesktop ? mobilePlaceholderRef : desktopPlaceholderRef;

//       let rect = primaryRef.current?.getBoundingClientRect();
//       if (!rect || rect.width === 0 || rect.height === 0) {
//         rect = fallbackRef.current?.getBoundingClientRect();
//       }

//       if (!rect || rect.width === 0 || rect.height === 0) return;

//       setVideoStyle({
//         position: 'fixed',
//         top: rect.top,
//         left: rect.left,
//         width: rect.width,
//         height: rect.height,
//         zIndex: 20,
//         opacity: 1,
//       });
//     };

//     const timers = [0, 50, 100, 200].map((delay) => setTimeout(updateVideoPosition, delay));

//     const observer = new ResizeObserver(updateVideoPosition);
//     if (desktopPlaceholderRef.current) observer.observe(desktopPlaceholderRef.current);
//     if (mobilePlaceholderRef.current) observer.observe(mobilePlaceholderRef.current);

//     window.addEventListener('resize', updateVideoPosition);
//     window.addEventListener('scroll', updateVideoPosition, true);

//     return () => {
//       timers.forEach(clearTimeout);
//       observer.disconnect();
//       window.removeEventListener('resize', updateVideoPosition);
//       window.removeEventListener('scroll', updateVideoPosition, true);
//     };
//   }, [isDesktop]);

//   const updateCurrentTime = useCallback((time: number) => {
//     setCurrentTime(time);
//   }, []);

//   const requestSeek = useCallback((time: number) => {
//     setCurrentTime(time);
//   }, []);

//   // 댓글 추가 - 실제 API 사용
//   const handleAddComment = useCallback(async () => {
//     if (!commentDraft.trim() || !videoId) return;

//     try {
//       // createVideoComment는 { serverId, content }만 반환
//       const result = await createVideoComment(Number(videoId), {
//         content: commentDraft,
//         timestampMs: Math.round(currentTime * 1000),
//       });

//       // 새 댓글을 로컬 상태에 추가 (임시 데이터)
//       // 실제로는 서버에서 전체 댓글 정보를 다시 받아와야 함
//       const newComment: Comment = {
//         id: result.serverId,
//         content: result.content,
//         timestamp: currentTime,
//         createdAt: new Date().toISOString(),
//         author: '나', // TODO: 현재 사용자 정보 가져오기
//         userId: 'me',
//         replies: [],
//       };

//       setComments((prev) => [...prev, newComment]);
//       setCommentDraft('');
//     } catch (err) {
//       alert(err instanceof Error ? err.message : '댓글 추가에 실패했습니다.');
//     }
//   }, [commentDraft, currentTime, videoId]);

//   const handleGoToTimeRef = useCallback(
//     (time: number) => {
//       requestSeek(time);
//     },
//     [requestSeek]
//   );

//   // 답글 추가 - 실제 API 사용
//   const addReply = useCallback(async (commentId: string, content: string) => {
//     try {
//       const result = await createCommentReply(Number(commentId), { content });

//       // 답글을 로컬 상태에 추가
//       setComments((prev) =>
//         prev.map((comment) =>
//           comment.id === commentId
//             ? {
//                 ...comment,
//                 replies: [
//                   ...comment.replies,
//                   {
//                     id: result.serverId,
//                     content: result.content,
//                     createdAt: new Date().toISOString(),
//                     author: currentUser?.name ?? '알 수 없음',
//                     userId: currentUser?.id ?? 'me',
//                   },
//                 ],
//               }
//             : comment
//         )
//       );
//     } catch (err) {
//       alert(err instanceof Error ? err.message : '답글 추가에 실패했습니다.');
//     }
//   }, []);

//   // 댓글 삭제 - 실제 API 사용
//   const handleDeleteComment = useCallback(async (commentId: string) => {
//     if (!confirm('댓글을 삭제하시겠습니까?')) return;

//     try {
//       await deleteVideoComment(Number(commentId));
//       setComments((prev) => prev.filter((comment) => comment.id !== commentId));
//     } catch (err) {
//       console.error('댓글 삭제 실패:', err);
//       alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.');
//     }
//   }, []);

//   // 댓글 수정 - comments API 사용
//   const handleUpdateComment = useCallback(async (commentId: string, newContent: string) => {
//     try {
//       await updateComment(commentId, { content: newContent });

//       setComments((prev) =>
//         prev.map((comment) =>
//           comment.id === commentId ? { ...comment, content: newContent } : comment
//         )
//       );
//     } catch (err) {
//       console.error('댓글 수정 실패:', err);
//       alert(err instanceof Error ? err.message : '댓글 수정에 실패했습니다.');
//     }
//   }, []);

//   const handleBack = () => {
//     navigate(`/${projectId}/videos`);
//   };

//   const timestampPrefix = `[${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}] `;

//   // 로딩 중
//   if (isLoading) {
//     return (
//       <div className="flex h-full items-center justify-center bg-gray-100">
//         <div className="h-12 w-12 animate-spin rounded-full border-4 border-main border-t-transparent" />
//       </div>
//     );
//   }

//   // 에러 또는 데이터 없음
//   if (error || !videoData) {
//     return (
//       <div className="flex h-full items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <h2 className="mb-4 text-xl font-bold text-red-500">오류 발생</h2>
//           <p className="mb-6 text-gray-600">{error || '영상을 찾을 수 없습니다'}</p>
//           <button
//             onClick={handleBack}
//             className="rounded-lg bg-main px-6 py-2 text-white hover:bg-main-variant2"
//           >
//             목록으로 돌아가기
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const webcamVideoUrl = videoData.video.hlsMasterUrl;

//   return (
//     <div className="flex h-full w-full bg-gray-100">
//       {/* 뒤로가기 헤더 (모바일) */}
//       <div className="fixed left-0 right-0 top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
//         <button onClick={handleBack} className="p-1">
//           <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>
//         <h1 className="truncate text-lg font-bold">{videoData.video.title}</h1>
//       </div>

//       {/* 데스크톱 뷰 */}
//       <div className="hidden flex-1 px-8 py-6 md:flex">
//         {/* 뒤로가기 버튼 */}
//         <div className="absolute left-4 top-4 z-30">
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow transition hover:bg-gray-50"
//           >
//             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//             <span className="text-sm font-medium">목록으로</span>
//           </button>
//         </div>

//         <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 pt-14">
//           {/* 비디오 위치 placeholder */}
//           <div className="flex min-w-0 flex-1 flex-col justify-center">
//             <div ref={desktopPlaceholderRef} className="aspect-video w-full" />
//           </div>
//           <ScriptSection
//             slides={projectSlides}
//             slideChangeTimes={slideChangeTimes}
//             currentTime={currentTime}
//             onSeek={requestSeek}
//             isLoading={false}
//           />
//         </div>

//         <aside className="flex w-96 shrink-0 flex-col border-l border-gray-200 bg-white">
//           <div className="min-h-0 flex-1 overflow-y-auto">
//             <CommentList
//               comments={comments}
//               onAddReply={addReply}
//               onGoToRef={handleGoToTimeRef}
//               onDeleteComment={handleDeleteComment}
//               onUpdateComment={handleUpdateComment}
//               isLoading={false}
//             />
//           </div>

//           <div className="flex shrink-0 flex-col gap-6 border-t border-black/5 px-4 pb-6 pt-4">
//             <CommentInput
//               value={commentDraft}
//               onChange={setCommentDraft}
//               onSubmit={handleAddComment}
//               onCancel={() => setCommentDraft('')}
//               className="w-full items-end"
//               initialValueOnFocus={timestampPrefix}
//             />
//           </div>
//         </aside>
//       </div>

//       {/* 모바일 뷰 */}
//       <div className="flex-1 pt-14 md:hidden">
//         <FeedbackMobileLayout
//           mediaSlot={<div ref={mobilePlaceholderRef} className="aspect-video w-full" />}
//           reactionSlot={null}
//           scriptTabContent={
//             <ScriptSection
//               slides={projectSlides}
//               slideChangeTimes={slideChangeTimes}
//               currentTime={currentTime}
//               onSeek={requestSeek}
//             />
//           }
//           commentTabContent={
//             <>
//               <div className="min-h-0 flex-1 overflow-y-auto">
//                 <CommentList
//                   comments={comments}
//                   onAddReply={addReply}
//                   onGoToRef={handleGoToTimeRef}
//                   onDeleteComment={handleDeleteComment}
//                   onUpdateComment={handleUpdateComment}
//                 />
//               </div>
//               <div className="shrink-0 border-t px-4 py-3">
//                 <CommentInput
//                   value={commentDraft}
//                   onChange={setCommentDraft}
//                   onSubmit={handleAddComment}
//                   onCancel={() => setCommentDraft('')}
//                   className="w-full"
//                   initialValueOnFocus={timestampPrefix}
//                 />
//               </div>
//             </>
//           }
//           commentCount={comments.length}
//         />
//       </div>

//       {/* 단일 SlideWebcamStage - CSS로 위치 조정 */}
//       <div style={videoStyle}>
//         <SlideWebcamStage
//           slides={projectSlides}
//           slideChangeTimes={slideChangeTimes}
//           webcamVideoUrl={webcamVideoUrl}
//           onTimeUpdate={updateCurrentTime}
//           disablePip={!isDesktop}
//           showLayoutToggle={!isDesktop}
//         />
//       </div>
//     </div>
//   );
// }
