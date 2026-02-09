import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { Presentation } from '@/types';
import type { FilterMode, SortMode, ViewMode } from '@/types/home';
import { showToast } from '@/utils/toast';

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

export default function VideoListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState<Presentation[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const hasProjects = projects.length > 0;

  useEffect(() => {
    if (location.state?.uploadSuccess) {
      showToast.success('영상이 성공적으로 저장되었습니다!');
      navigate(location.pathname, { replace: true, state: {} });
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

        const formattedProjects: Presentation[] = mockVideos.map((video) => ({
          projectId: String(video.id),
          title: video.title,
          thumbnailUrl: undefined,
          slideCount: video.slideCount,
          feedbackCount: 0,
          durationSeconds: video.durationSeconds,
          createdAt: video.createdAt,
          updatedAt: video.createdAt,
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
                    <PresentationCard key={item.projectId} {...item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((item) => (
                    <PresentationList key={item.projectId} {...item} />
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
