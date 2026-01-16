import { useEffect, useState } from 'react';

import IntroSection from '@/components/home/IntroSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilteredProjects } from '@/hooks/useFilteredProjects';
import { useHomeActions, useHomeQuery } from '@/hooks/useHomeSelectors';
import { useUpload } from '@/hooks/useUpload';
import { MOCK_PROJECTS } from '@/mocks/projects';

const ACCEPTED_FILES_TYPES = '.pdf,.ppt,.pptx,.txt,.mp4';

export default function HomePage() {
  const { progress, state, error, uploadFiles } = useUpload();
  const [isLoading, setIsLoading] = useState(true);
  const query = useHomeQuery();
  const { setQuery } = useHomeActions();
  const debouncedQuery = useDebounce(query, 300);

  // TODO : 나중에 mock data 말고 바꿔주기..
  const filteredProjects = useFilteredProjects(MOCK_PROJECTS, debouncedQuery);
  const isEmpty = !isLoading && MOCK_PROJECTS.length === 0;

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
        query={query}
        onChangeQuery={setQuery}
        projects={filteredProjects}
      />
    </main>
  );
}
