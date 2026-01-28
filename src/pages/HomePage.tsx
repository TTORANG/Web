import { useEffect, useMemo, useState } from 'react';

import IntroSection from '@/components/home/IntroSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useHomeActions,
  useHomeFilter,
  useHomeQuery,
  useHomeSort,
  useHomeViewMode,
} from '@/hooks/useHomeSelectors';
import { useProjectList } from '@/hooks/useProjectList';
import { useUpload } from '@/hooks/useUpload';
import { MOCK_PROJECTS } from '@/mocks/projects';
import type { Project } from '@/types';

const ACCEPTED_FILES_TYPES = '.pdf,.ppt,.pptx,.txt,.mp4';

export default function HomePage() {
  const { progress, state, error, uploadFiles } = useUpload();
  const [isLoading, setIsLoading] = useState(true);
  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();

  const filterFn = useMemo<((p: Project) => boolean) | undefined>(() => {
    if (filter === null || filter === 'all') return undefined;

    return (p: Project) => {
      switch (filter) {
        case '3m':
          return p.durationMinutes <= 3;
        case '5m':
          return p.durationMinutes <= 5;

        default:
          return true;
      }
    };
  }, [filter]);

  const viewMode = useHomeViewMode();
  const { setQuery, setSort, setFilter, setViewMode } = useHomeActions();
  const debouncedQuery = useDebounce(query, 300);

  // TODO :  나중에 mock_projects 말고 서버데이터로 바꿔주기..
  const allProjects = MOCK_PROJECTS;
  const projects = useProjectList(allProjects, { query: debouncedQuery, sort, filterFn });

  const totalCount = allProjects.length;
  const isEmpty = !isLoading && totalCount === 0;

  // TODO : 실제 데이터 패칭 훅의 isLoading으로 교체
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      {/* 소개글 & 파일 업로드 */}
      <IntroSection
        accept={ACCEPTED_FILES_TYPES}
        disabled={state === 'uploading'}
        uploadState={state}
        progress={progress}
        error={error}
        onFilesSelected={uploadFiles}
        isEmpty={isEmpty}
      />

      {/* 내발표 */}
      <ProjectsSection
        isLoading={isLoading}
        totalCount={totalCount}
        query={query}
        onChangeQuery={setQuery}
        sort={sort}
        onChangeSort={setSort}
        filter={filter}
        onChangeFilter={setFilter}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        projects={projects}
      />
    </main>
  );
}
