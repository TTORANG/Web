import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMyVideos } from '@/hooks/useVideos';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';
import type { VideoPresentation } from '@/types/video';

import { CardView, ListView } from '../common';
import PresentationCard from '../presentation/PresentationCard';
import PresentationHeader from '../presentation/PresentationHeader';
import PresentationList from '../presentation/PresentationList';
import { RecordingEmptySection } from './RecordingEmptySection';

const SKELETON_CARD_COUNT = 6;
const SKELETON_LIST_COUNT = 4;

export default function VideoListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const { data, isLoading } = useMyVideos({
    search: appliedQuery,
    filter,
    sort,
  });

  const videos: VideoPresentation[] = data?.videos || [];
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
    navigate('/recording');
  };

  return (
    <div className="min-h-screen bg-background">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">영상이 성공적으로 저장되었습니다!</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-display-s-bold text-gray-900 mb-2">녹화된 영상</h1>
            <p className="text-body-m-medium text-gray-500">발표 연습 영상을 선택해서 확인하세요</p>
          </div>
          {!isLoading && totalCount > 0 && (
            <button
              onClick={handleStartRecording}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition"
            >
              영상 녹화하기
            </button>
          )}
        </div>

        {!isLoading && totalCount === 0 && !hasAppliedQuery ? (
          <div className="flex justify-center py-20">
            <RecordingEmptySection onStart={handleStartRecording} />
          </div>
        ) : (
          <section>
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

            {isLoading || isDebouncing ? (
              viewMode === 'card' ? (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
                    <PresentationCard.Skeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3">
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
                    className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
                    renderCard={(item) => <PresentationCard {...item} />}
                    empty={null}
                  />
                ) : (
                  <ListView
                    items={videos}
                    getKey={(item) => item.projectId}
                    className="mt-6 flex flex-col gap-3"
                    renderInfo={(item) => <PresentationList {...item} />}
                    empty={null}
                  />
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
