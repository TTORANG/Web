import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { toast } from 'sonner';

import { videosApi } from '@/api/endpoints/videos';
import { CardView, ListView } from '@/components/common';
import ProcessingOverlay from '@/components/common/ProcessingOverlay';
import PresentationCard from '@/components/presentation/PresentationCard';
import PresentationHeader from '@/components/presentation/PresentationHeader';
import PresentationList from '@/components/presentation/PresentationList';
import { DeleteVideoModal, RecordingEmptySection } from '@/components/video';
import { useProjectVideos } from '@/hooks/useProjectVideos';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';

const SKELETON_CARD_COUNT = 6;
const SKELETON_LIST_COUNT = 4;

export default function VideoListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [deletingVideoIds, setDeletingVideoIds] = useState<Set<string>>(new Set());

  // 삭제 확인 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading, error, refetch } = useProjectVideos({
    projectId: projectId!,
    search: appliedQuery,
    filter,
    sort,
  });

  const videos = data?.videos || [];
  const totalCount = data?.total || 0;

  const isDebouncing = query.trim() !== appliedQuery.trim();
  const hasAppliedQuery = appliedQuery.trim().length > 0;
  const hasResults = videos.length > 0;

  const hasProcessingVideos = videos.some((video) => {
    if (video.status !== 'uploading' && video.status !== 'processing') return false;

    const createdAt = new Date(video.createdAt);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceCreated < 1;
  });

  useEffect(() => {
    if (location.state?.uploadSuccess) {
      setShowSuccessToast(true);
      navigate(location.pathname, { replace: true, state: {} });
      refetch();
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate, refetch]);

  useEffect(() => {
    if (!hasProcessingVideos) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [hasProcessingVideos, refetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStartRecording = () => {
    navigate(`/${projectId}/video/record`);
  };

  const handleVideoClick = (videoId: string, status: string) => {
    if (status === 'uploading' || status === 'processing') {
      toast.info('영상을 처리 중입니다', {
        description: '잠시만 기다려주세요. 처리가 완료되면 확인하실 수 있습니다.',
      });
      return;
    }

    if (status === 'failed') {
      toast.error('영상 처리에 실패했습니다', {
        description: '다시 녹화해주세요.',
      });
      return;
    }

    navigate(`/${projectId}/videos/${videoId}`);
  };

  const handleDeleteClick = (videoId: string, title: string) => {
    setVideoToDelete({ id: videoId, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    setDeleteModalOpen(false);
    setDeletingVideoIds((prev) => new Set(prev).add(videoToDelete.id));

    try {
      const response = await videosApi.deleteVideo(videoToDelete.id);

      if (response.data.resultType === 'SUCCESS') {
        toast.success('영상이 삭제되었습니다');
        refetch();
      } else {
        throw new Error(response.data.error?.reason || '삭제 실패');
      }
    } catch (err) {
      console.error('[VideoListPage] Delete error:', err);
      toast.error('삭제 실패', {
        description: err instanceof Error ? err.message : '영상을 삭제할 수 없습니다',
      });
    } finally {
      setDeletingVideoIds((prev) => {
        const next = new Set(prev);
        next.delete(videoToDelete.id);
        return next;
      });
      setVideoToDelete(null);
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">잘못된 접근입니다</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-6">잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="tabpanel"
      id="tabpanel-video"
      aria-labelledby="tab-video"
      className="relative h-full w-full overflow-y-auto bg-gray-100"
    >
      {/* 성공 토스트 */}
      {showSuccessToast && (
        <div className="fixed right-4 top-4 z-50 flex animate-slide-in items-center gap-2 rounded-lg bg-success px-6 py-3 shadow-lg">
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-body-m-bold text-white">영상이 성공적으로 저장되었습니다!</span>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <DeleteVideoModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
        title={videoToDelete?.title}
        onConfirm={handleConfirmDelete}
      />

      {!isLoading && totalCount === 0 && !hasAppliedQuery ? (
        <div className="flex h-full items-center justify-center">
          <RecordingEmptySection onStart={handleStartRecording} />
        </div>
      ) : (
        <main className="flex h-full flex-col px-18 py-8">
          <div className="mb-6">
            <h1 className="text-body-l-bold text-gray-800 mb-1">녹화된 영상</h1>
            <p className="text-body-s text-gray-600">발표 연습 영상을 선택해서 확인하세요</p>
          </div>

          <div className="mb-4 flex justify-end">
            <button
              onClick={handleStartRecording}
              disabled={isLoading}
              className="px-6 py-2.5 bg-main hover:bg-main-variant2 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]"
            >
              영상 녹화하기
            </button>
          </div>

          <div className="mb-4">
            <PresentationHeader
              value={query}
              onChange={setQuery}
              sort={sort}
              onChangeSort={setSort}
              filter={filter}
              onChangeFilter={setFilter}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
            />
          </div>

          <section className="flex-1">
            {isLoading || isDebouncing ? (
              viewMode === 'card' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
                    <PresentationCard.Skeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: SKELETON_LIST_COUNT }).map((_, index) => (
                    <PresentationList.Skeleton key={index} />
                  ))}
                </div>
              )
            ) : !hasResults ? (
              <div className="flex items-center justify-center p-40">
                <p className="text-body-m text-gray-500">
                  {hasAppliedQuery
                    ? `'${appliedQuery}'에 대한 검색 결과를 찾지 못했어요.`
                    : '선택한 필터에 맞는 영상을 찾지 못했어요.'}
                </p>
              </div>
            ) : (
              <div>
                {viewMode === 'card' ? (
                  <CardView
                    items={videos}
                    getKey={(item) => item.videoId?.toString() || ''}
                    className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    renderCard={(item) => {
                      const now = new Date();
                      const createdAt = new Date(item.createdAt);
                      const hoursSinceCreated =
                        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

                      const isStuck =
                        (item.status === 'uploading' || item.status === 'processing') &&
                        hoursSinceCreated > 1;

                      const isProcessing =
                        (item.status === 'uploading' || item.status === 'processing') && !isStuck;

                      const isFailed = item.status === 'failed' || isStuck;
                      const isDeleting = deletingVideoIds.has(item.videoId?.toString() || '');

                      return (
                        <div
                          className="relative"
                          onClick={() =>
                            handleVideoClick(
                              item.videoId?.toString() || '',
                              isStuck ? 'failed' : item.status,
                            )
                          }
                        >
                          <PresentationCard
                            {...item}
                            mode="videos"
                            onDelete={() =>
                              handleDeleteClick(item.videoId?.toString() || '', item.title)
                            }
                          />

                          {isProcessing && (
                            <ProcessingOverlay visible variant="card" className="rounded-2xl" />
                          )}

                          {isFailed && !isDeleting && (
                            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10">
                              <div className="text-center">
                                <svg
                                  className="h-12 w-12 text-red-500 mx-auto mb-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                                <p className="text-white text-sm font-bold mb-3">
                                  {isStuck ? '처리 시간 초과' : '처리 실패'}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(item.videoId?.toString() || '', item.title);
                                  }}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          )}

                          {isDeleting && (
                            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                              <div className="text-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto mb-3" />
                                <p className="text-white text-sm font-bold">삭제 중...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                    empty={null}
                  />
                ) : (
                  <ListView
                    items={videos}
                    getKey={(item) => item.videoId?.toString() || ''}
                    className="flex flex-col gap-3"
                    renderInfo={(item) => (
                      <div
                        onClick={() =>
                          handleVideoClick(item.videoId?.toString() || '', item.status)
                        }
                      >
                        <PresentationList
                          {...item}
                          mode="videos"
                          onDelete={() =>
                            handleDeleteClick(item.videoId?.toString() || '', item.title)
                          }
                        />
                      </div>
                    )}
                    empty={null}
                  />
                )}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
