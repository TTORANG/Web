import { useEffect, useMemo, useState } from 'react';

import IntroSection from '@/components/home/IntroSection';
import ProjectsCard from '@/components/projects/ProjectCard';
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton';
import ProjectHeader from '@/components/projects/ProjectHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { useUpload } from '@/hooks/useUpload';
import { MOCK_PROJECTS } from '@/mocks/projects';

const ACCEPTED_FILES_TYPES = '.pdf,.ppt,.pptx,.txt,.mp4';

export default function HomePage() {
  const { progress, state, error, uploadFiles } = useUpload();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [isLoading, setIsLoading] = useState(true);

  // TODO : 실제 데이터 패칭 훅의 isLoading으로 교체
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter((p) => p.title.toLowerCase().includes(q));
  }, [debouncedQuery]);

  const hasProjects = filteredProjects.length > 0;
  const showSection = isLoading || hasProjects;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      {/* 소개글 & 파일 업로드 */}
      <IntroSection
        accept={ACCEPTED_FILES_TYPES}
        disabled={state == 'uploading'}
        uploadState={state}
        progress={progress}
        error={error}
        onFilesSelected={uploadFiles}
        isEmpty={!hasProjects}
      />

      {/* 내발표 */}
      {showSection && (
        <section className="mt-14">
          {/* 제목 */}
          <div className="mb-4">
            <h2 className="text-body-m-bold">내 발표</h2>
          </div>

          {/* 검색 */}
          <ProjectHeader value={query} onChange={setQuery} />

          {/* 프레젠테이션 목록 */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <ProjectCardSkeleton key={index} />)
              : filteredProjects.map((project) => <ProjectsCard key={project.id} {...project} />)}
          </div>
        </section>
      )}
    </main>
  );
}
