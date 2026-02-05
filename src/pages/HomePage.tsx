import { useEffect, useMemo, useState } from 'react';

//import { useNavigate } from 'react-router-dom';

import IntroSection from '@/components/home/IntroSection';
import PresentationsSection from '@/components/home/PresentationsSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeFilter, useHomeQuery, useHomeSort } from '@/hooks/useHomeSelectors';
import { usePresentationList } from '@/hooks/usePresentationList';
import { useUploadFile } from '@/hooks/useUploadFile';
import { MOCK_PROJECTS } from '@/mocks/projects';
import type { Presentation } from '@/types/presentation';
import { showToast } from '@/utils/toast';

const ACCEPTED_FILES_TYPES = '.pptx,.pdf';
// const MAX_SIZE_MB = 1_000; // 1GB
// const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function HomePage() {
  //const navigate = useNavigate();
  const { uploadFile, cancelUpload, isUploading, progress, error } = useUploadFile();

  const onFileSelected = async (file: File) => {
    const response = await uploadFile({ file, title: file.name });

    if (response?.resultType === 'SUCCESS') {
      showToast.success('업로드 완료!');
      //const projectId = response.success.projectId;
      //navigate(`/presentations/${projectId}`);
    }
  };
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
          return p.durationSeconds <= 180; // 3분 = 180초
        case '5m':
          return p.durationSeconds <= 300; // 5분 = 300초

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
        resetUpload={cancelUpload}
        disabled={isUploading}
        currentStep={progress.currentStep}
        progress={progress.percentage}
        error={error}
        onFileSelected={onFileSelected}
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
