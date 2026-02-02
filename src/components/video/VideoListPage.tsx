import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { FilterMode, SortMode, ViewMode } from '@/types/home';

import PresentationCard from '../presentation/PresentationCard';
import PresentationHeader from '../presentation/PresentationHeader';
import PresentationList from '../presentation/PresentationList';
import { RecordingEmptySection } from './RecordingEmptySection';

interface MockVideo {
  id: number;
  title: string;
  createdAt: string;
  durationSeconds: number;
  slideCount: number;
  size: number;
}

interface Project {
  id: string;
  title: string;
  updatedAt: string;
  durationMinutes: number;
  pageCount: number;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  [key: string]: unknown;
}

export default function VideoListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const hasProjects = projects.length > 0;

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
    const loadMockVideos = () => {
      try {
        const storedData = localStorage.getItem('mockVideos');
        if (!storedData) {
          setProjects([]);
          return;
        }

        const mockVideos: MockVideo[] = JSON.parse(storedData);

        const formattedProjects: Project[] = mockVideos.map((video) => ({
          id: String(video.id),
          title: video.title,
          updatedAt: video.createdAt,
          durationMinutes: Math.ceil(video.durationSeconds / 60),
          pageCount: video.slideCount,
          commentCount: 0,
          reactionCount: 0,
          viewCount: 0,
        }));

        setProjects(formattedProjects);
      } catch {
        setProjects([]);
      }
    };

    loadMockVideos();
  }, []);

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
          {hasProjects && (
            <button
              onClick={handleStartRecording}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition"
            >
              영상 녹화하기
            </button>
          )}
        </div>

        {!hasProjects ? (
          //   <div
          //     className={
          //       viewMode === 'card' ? 'grid grid-cols-2 gap-4 lg:grid-cols-3' : 'flex flex-col gap-3'
          //     }
          //   >
          //     {Array.from({ length: 6 }).map((_, i) =>
          //       viewMode === 'card' ? (
          //         <ProjectCard.Skeleton key={i} />
          //       ) : (
          //         <ProjectList.Skeleton key={i} />
          //       ),
          //     )}
          //   </div>
          // ) : (
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

            <div className="mt-6">
              {viewMode === 'card' ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {projects.map((item) => (
                    <PresentationCard key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((item) => (
                    <PresentationList key={item.id} {...item} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
