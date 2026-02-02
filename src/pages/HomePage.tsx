import { useEffect, useMemo, useState } from 'react';

import IntroSection from '@/components/home/IntroSection';
import PresentationsSection from '@/components/home/PresentationsSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeFilter, useHomeQuery, useHomeSort } from '@/hooks/useHomeSelectors';
import { usePresentationList } from '@/hooks/usePresentationList';
import { useUpload } from '@/hooks/useUpload';
import { MOCK_PROJECTS } from '@/mocks/projects';
import type { Presentation } from '@/types/presentation';

const ACCEPTED_FILES_TYPES = '.pdf,.ppt,.pptx,.txt,.mp4';

export default function HomePage() {
  const { progress, state, error, uploadFiles } = useUpload();
  const [isLoading, setIsLoading] = useState(true);

  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();

  const debouncedQuery = useDebounce(query, 300);

  // TODO :  나중에 mock_projects 말고 서버데이터로 바꿔주기..
  const allPresentations = MOCK_PROJECTS;

  const filterFn = useMemo<((p: Presentation) => boolean) | undefined>(() => {
    if (filter === null || filter === 'all') return undefined;

    return (p: Presentation) => {
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

  // 1) 필터만 적용한 목록
  const filteredPresentations = useMemo(() => {
    return filterFn ? allPresentations.filter(filterFn) : allPresentations;
  }, [allPresentations, filterFn]);

  const totalCount = allPresentations.length;
  const filteredCount = filteredPresentations.length;

  // 2) 검색/정렬은 '필터된 목록' 기준으로만 적용
  const presentations = usePresentationList(filteredPresentations, { query: debouncedQuery, sort });

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
      <PresentationsSection
        isLoading={isLoading}
        totalCount={totalCount}
        filteredCount={filteredCount}
        appliedQuery={debouncedQuery}
        presentations={presentations}
      />
    </main>
  );
}
