import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { videosApi } from '@/api/endpoints/videos';
import { queryKeys } from '@/api/queryClient';
import { CardView, ListView, Spinner } from '@/components/common';
import PresentationCard from '@/components/presentation/PresentationCard';
import PresentationHeader from '@/components/presentation/PresentationHeader';
import PresentationList from '@/components/presentation/PresentationList';
import { DeleteVideoModal, RecordingEmptySection } from '@/components/video';
import { usePresentationVideos } from '@/hooks/usePresentationVideos';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';
import { showToast } from '@/utils/toast';

const SKELETON_CARD_COUNT = 6;
const SKELETON_LIST_COUNT = 4;
const DEFAULT_VIDEO_EXTENSION = 'mp4';

type DeleteTarget = { id: string; title: string } | null;
type VideoListQueryData = { videos: VideoPresentation[]; total: number };

function sanitizeFilename(fileName: string): string {
  const sanitized = fileName.replace(/[\\/:*?"<>|]+/g, '_').trim();
  return sanitized.length > 0 ? sanitized : 'video';
}

function parseFileExtension(url: string): string {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const fileName = pathname.split('/').pop() ?? '';
    const matched = fileName.match(/\.([a-zA-Z0-9]+)$/);
    return matched?.[1]?.toLowerCase() || DEFAULT_VIDEO_EXTENSION;
  } catch {
    return DEFAULT_VIDEO_EXTENSION;
  }
}

function startVideoDownload(downloadUrl: string, title: string) {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${sanitizeFilename(title)}.${parseFileExtension(downloadUrl)}`;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function updateVideoListCache(
  queryClient: QueryClient,
  projectId: string,
  updater: (data: VideoListQueryData) => VideoListQueryData | undefined,
) {
  queryClient.setQueriesData<VideoListQueryData>(
    {
      queryKey: queryKeys.videos.listPrefix(projectId),
    },
    (oldData) => {
      if (!oldData) return undefined;
      return updater(oldData);
    },
  );
}

export default function VideoListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // UI 상태
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  // 삭제 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<DeleteTarget>(null);
  const [deletingVideoIds, setDeletingVideoIds] = useState<Set<string>>(new Set());
  const downloadingVideoIdsRef = useRef<Set<string>>(new Set());

  // 썸네일/처리 폴링 상태
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [thumbVersion, setThumbVersion] = useState<Record<string, number>>({});

  const { data, isLoading, error, refetch } = usePresentationVideos({
    projectId: projectId!,
    search: appliedQuery,
    filter,
    sort,
  });

  const rawVideos = useMemo(() => data?.videos ?? [], [data?.videos]);
  const totalCount = data?.total ?? 0;

  // 검색 디바운스
  useEffect(() => {
    const t = setTimeout(() => setAppliedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isDebouncing = query.trim() !== appliedQuery.trim();
  const hasAppliedQuery = appliedQuery.trim().length > 0;

  // 최초 진입에서는 스켈레톤 대신 중앙 스피너를 보여 깜빡임을 줄입니다.
  useEffect(() => {
    if (!isLoading && !hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true);
    }
  }, [isLoading, hasCompletedInitialLoad]);

  // 업로드 성공 → 토스트 + state 정리 + refetch
  useEffect(() => {
    if (!location.state?.uploadSuccess) return;

    showToast.success('영상을 저장했습니다.');
    navigate(location.pathname, { replace: true, state: {} });
    if (!projectId) return;

    void queryClient.invalidateQueries({
      queryKey: queryKeys.videos.listPrefix(projectId),
    });
  }, [location.state, location.pathname, navigate, projectId, queryClient]);

  // processing 1시간 초과면 stuck 처리 (파생 데이터로 정리)
  const videos = useMemo(() => {
    const now = Date.now();

    return rawVideos.map((v) => {
      const createdAt = new Date(v.createdAt).getTime();
      const hours = (now - createdAt) / (1000 * 60 * 60);
      const isStuck = v.status === 'processing' && hours > 1;

      return {
        ...v,
        derivedStatus: isStuck ? 'failed' : v.status,
        isStuck,
        isFailed: v.status === 'failed' || isStuck,
        isPending: (v.status === 'processing' || v.status === 'uploading') && !v.thumbnailUrl,
      };
    });
  }, [rawVideos]);

  const hasResults = videos.length > 0;

  // pendingIds 갱신: processing or thumbnail 없음인 videoId를 Set에 추가
  useEffect(() => {
    if (videos.length === 0) return;

    setPendingIds((prev) => {
      const next = new Set(prev);
      videos.forEach((v) => {
        if (v.isPending) next.add(String(v.videoId));
      });
      return next;
    });
  }, [videos]);

  // 폴링: pendingIds가 있을 때만 3초마다 refetch → 완료된 id 제거 + thumbVersion bump
  useEffect(() => {
    if (pendingIds.size === 0) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;

      const res = await refetch();
      const fresh = res.data?.videos ?? [];

      const doneIds: string[] = [];

      fresh.forEach((v) => {
        const id = String(v.videoId);
        const isDone = Boolean(v.thumbnailUrl) || v.status === 'failed';
        if (pendingIds.has(id) && isDone) doneIds.push(id);
      });

      if (doneIds.length > 0) {
        setThumbVersion((prev) => {
          const next = { ...prev };
          doneIds.forEach((id) => (next[id] = (next[id] ?? 0) + 1));
          return next;
        });

        setPendingIds((prev) => {
          const next = new Set(prev);
          doneIds.forEach((id) => next.delete(id));
          return next;
        });
      }

      // 아직 남아있으면 계속
      timeoutId = setTimeout(poll, 3000);
    };

    timeoutId = setTimeout(poll, 3000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pendingIds, refetch]);

  const handleStartRecording = useCallback(() => {
    navigate(`/${projectId}/video/record`);
  }, [navigate, projectId]);

  const handleVideoClick = useCallback(
    (videoId: string, status: string) => {
      if (status === 'processing') {
        toast.info('영상을 처리하고 있습니다.', {
          description: '처리가 완료되면 확인할 수 있습니다.',
        });
        return;
      }
      if (status === 'failed') {
        toast.error('영상 처리에 실패했습니다.', {
          description: '다시 녹화해주세요.',
        });
        return;
      }
      navigate(`/${projectId}/videos/${videoId}`);
    },
    [navigate, projectId],
  );

  const handleUpdateVideoTitle = useCallback(
    async (videoId: string, newTitle: string) => {
      if (!projectId) return;

      const updatedVideo = await videosApi.updateVideoTitle(videoId, newTitle);
      updateVideoListCache(queryClient, projectId, (oldData) => {
        let hasUpdated = false;
        const nextVideos = oldData.videos.map((video) => {
          if (String(video.videoId) !== String(videoId)) return video;
          hasUpdated = true;
          return {
            ...video,
            title: updatedVideo.title,
            updatedAt: updatedVideo.updatedAt,
          };
        });

        if (!hasUpdated) return oldData;

        return {
          ...oldData,
          videos: nextVideos,
        };
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.videos.listPrefix(projectId),
      });
    },
    [projectId, queryClient],
  );

  const handleDownloadVideo = useCallback(async (video: VideoPresentation) => {
    const videoId = String(video.videoId ?? '');
    if (!videoId) {
      showToast.error('영상 다운로드에 실패했습니다.', '유효하지 않은 영상 ID입니다.');
      return;
    }

    if (video.status !== 'ready') {
      showToast.info('영상 처리 완료 후 다운로드할 수 있습니다.');
      return;
    }

    if (downloadingVideoIdsRef.current.has(videoId)) {
      return;
    }

    downloadingVideoIdsRef.current.add(videoId);

    try {
      const downloadUrl = video.downloadUrl?.trim();
      if (!downloadUrl) {
        throw new Error('목록 응답에 다운로드 URL이 없습니다.');
      }

      startVideoDownload(downloadUrl, video.title);
      showToast.success('영상 다운로드를 시작했습니다.');
    } catch (err) {
      showToast.error(
        '영상 다운로드에 실패했습니다.',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      downloadingVideoIdsRef.current.delete(videoId);
    }
  }, []);

  const openDeleteModal = useCallback((id: string, title: string) => {
    setVideoToDelete({ id, title });
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setVideoToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!videoToDelete) return;
    if (!projectId) return;

    const { id } = videoToDelete;

    closeDeleteModal();
    setDeletingVideoIds((prev) => new Set(prev).add(id));

    try {
      const response = await videosApi.deleteVideo(id);

      if (response.data.resultType !== 'SUCCESS') {
        throw new Error(response.data.error?.reason || '삭제에 실패했습니다.');
      }

      showToast.success('영상을 삭제했습니다.');
      updateVideoListCache(queryClient, projectId, (oldData) => {
        const nextVideos = oldData.videos.filter((video) => String(video.videoId) !== String(id));
        if (nextVideos.length === oldData.videos.length) return oldData;

        return {
          ...oldData,
          videos: nextVideos,
          total: Math.max(0, oldData.total - 1),
        };
      });
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.videos.listPrefix(projectId),
      });
    } catch (err) {
      showToast.error(
        '영상을 삭제하지 못했습니다.',
        err instanceof Error ? err.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setDeletingVideoIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setVideoToDelete(null);
    }
  }, [videoToDelete, projectId, closeDeleteModal, queryClient]);

  const renderSkeleton = () => {
    if (viewMode === 'card') {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
            <PresentationCard.Skeleton key={i} />
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_LIST_COUNT }).map((_, i) => (
          <PresentationList.Skeleton key={i} />
        ))}
      </div>
    );
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">잘못된 접근입니다</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-main text-white px-6 py-2.5 rounded-lg font-bold hover:bg-main-variant2 transition"
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
            className="bg-main text-white px-6 py-2.5 rounded-lg font-bold hover:bg-main-variant2 transition"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const showInitialLoadingSpinner = !hasCompletedInitialLoad && isLoading;
  const showEmptyRecording =
    !showInitialLoadingSpinner && !isLoading && totalCount === 0 && !hasAppliedQuery;
  const showSkeletonUI = !showInitialLoadingSpinner && (isLoading || isDebouncing);

  return (
    <div
      role="tabpanel"
      id="tabpanel-videos"
      aria-labelledby="tab-videos"
      className="relative h-full w-full overflow-y-auto bg-gray-100"
    >
      <DeleteVideoModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={videoToDelete?.title}
        onConfirm={handleConfirmDelete}
      />

      {showInitialLoadingSpinner ? (
        <div className="flex h-full items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : showEmptyRecording ? (
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
            {showSkeletonUI ? (
              renderSkeleton()
            ) : !hasResults ? (
              <div className="flex items-center justify-center p-40">
                <p className="text-body-m text-gray-500">
                  {hasAppliedQuery
                    ? `'${appliedQuery}'에 대한 검색 결과를 찾지 못했어요.`
                    : '선택한 필터에 맞는 영상을 찾지 못했어요.'}
                </p>
              </div>
            ) : viewMode === 'card' ? (
              <CardView
                items={videos}
                getKey={(item) => String(item.videoId)}
                className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3"
                renderCard={(item) => {
                  const id = String(item.videoId);
                  const isDeleting = deletingVideoIds.has(id);
                  const isPending = pendingIds.has(id) || item.isPending;

                  return (
                    <div
                      className="relative"
                      onClick={() => handleVideoClick(id, item.derivedStatus)}
                    >
                      <PresentationCard
                        {...item}
                        mode="videos"
                        isPresentationPending={isPending}
                        thumbnailVersion={thumbVersion[id] ?? 0}
                        onDelete={() => openDeleteModal(id, item.title)}
                        onUpdateTitle={(newTitle) => handleUpdateVideoTitle(id, newTitle)}
                        onDownload={() => {
                          void handleDownloadVideo(item);
                        }}
                      />

                      {item.isFailed && !isDeleting && (
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
                              {item.isStuck ? '처리 시간 초과' : '처리 실패'}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(id, item.title);
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
                getKey={(item) => String(item.videoId)}
                className="flex flex-col gap-3"
                renderInfo={(item) => {
                  const id = String(item.videoId);
                  const isPending = pendingIds.has(id) || item.isPending;

                  return (
                    <div onClick={() => handleVideoClick(id, item.derivedStatus)}>
                      <PresentationList
                        {...item}
                        mode="videos"
                        isPresentationPending={isPending}
                        thumbnailVersion={thumbVersion[id] ?? 0}
                        onDelete={() => openDeleteModal(id, item.title)}
                        onUpdateTitle={(newTitle) => handleUpdateVideoTitle(id, newTitle)}
                        onDownload={() => {
                          void handleDownloadVideo(item);
                        }}
                      />
                    </div>
                  );
                }}
                empty={null}
              />
            )}
          </section>
        </main>
      )}
    </div>
  );
}
