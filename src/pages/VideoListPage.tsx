import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { CardView, ListView } from '@/components/common';
import PresentationCard from '@/components/presentation/PresentationCard';
import PresentationHeader from '@/components/presentation/PresentationHeader';
import PresentationList from '@/components/presentation/PresentationList';
import { RecordingEmptySection } from '@/components/video/RecordingEmptySection';
import { useProjectVideos } from '@/hooks/useProjectVideos';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';

const SKELETON_CARD_COUNT = 6;
const SKELETON_LIST_COUNT = 4;
interface Video {
  id: number;
  projectId: string;
  title: string;
  createdAt: string;
  durationSeconds: number;
  slideCount: number;
  size: number;
  videoData?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  durations?: { [key: number]: number };
}

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

  const { data, isLoading, error } = useProjectVideos({
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

  useEffect(() => {
    if (location.state?.uploadSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSuccessToast(true);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStartRecording = () => {
    navigate(`/${projectId}/video/record`);
  };
  const handleVideoClick = (video: Video) => {
    if (video.status === 'ready') {
      // 모달 대신 페이지로 이동
      navigate(`}/video/${video.id}`);
    } else if (video.status === 'processing') {
      alert('영상이 처리 중입니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('영상 처리에 실패했습니다.');
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
      {/* 업로드 성공 토스트 */}
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

      {/* 메인 컨텐츠 */}
      {!isLoading && totalCount === 0 && !hasAppliedQuery ? (
        <div className="flex h-full items-center justify-center">
          <RecordingEmptySection onStart={handleStartRecording} />
        </div>
      ) : (
        <main className="flex h-full flex-col px-18 py-8">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-body-l-bold text-gray-800 mb-1">녹화된 영상</h1>
            <p className="text-body-s text-gray-600">발표 연습 영상을 선택해서 확인하세요</p>
          </div>

          {/* 영상 녹화하기 버튼 */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleStartRecording}
              disabled={isLoading}
              className="px-6 py-2.5 bg-main hover:bg-main-variant2 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]"
            >
              영상 녹화하기
            </button>
          </div>
          {/* 검색/필터 헤더 */}
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

          {/* 콘텐츠 영역 */}
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
                    getKey={(item) => item.projectId}
                    className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    renderCard={(item) => <PresentationCard {...item} mode="videos" />}
                    empty={null}
                  />
                ) : (
                  <ListView
                    items={videos}
                    getKey={(item) => item.projectId}
                    className="flex flex-col gap-3"
                    renderInfo={(item) => <PresentationList {...item} mode="videos" />}
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
