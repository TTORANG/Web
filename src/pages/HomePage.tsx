import { useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import IntroSection from '@/components/home/IntroSection';
import PresentationsSection from '@/components/home/PresentationsSection';
import { usePresentations, usePresentationsWithFilters } from '@/hooks/queries/usePresentations';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeFilter, useHomeQuery, useHomeSort } from '@/hooks/useHomeSelectors';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

const ACCEPTED_FILES_TYPES = '.pptx,.pdf';
// const MAX_SIZE_MB = 1_000; // 1GB
// const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function HomePage() {
  //const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadFile, cancelUpload, isUploading, progress, error } = useUploadFile();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = Boolean(accessToken);

  const onFileSelected = async (file: File) => {
    const response = await uploadFile({ file, title: file.name });

    if (response?.resultType === 'SUCCESS') {
      showToast.success('업로드 완료!');
      void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
      //const projectId = response.success.projectId;
      //navigate(`/presentations/${projectId}`);
    }
  };

  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();

  const debouncedQuery = useDebounce(query, 300);
  const maxDuration = useMemo(() => {
    if (filter === null || filter === 'all') return undefined;
    if (filter === '3m') return 180;
    if (filter === '5m') return 300;
    return undefined;
  }, [filter]);

  const sortParam = useMemo(() => {
    if (!sort || sort === 'recent') return 'latest';
    if (sort === 'commentCount') return 'feedback';
    if (sort === 'name') return 'name';
    return undefined;
  }, [sort]);

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      search: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
      maxDuration,
      sort: sortParam,
    }),
    [debouncedQuery, maxDuration, sortParam],
  );

  const needsBaseTotal = useMemo(
    () => Boolean(debouncedQuery.trim() || maxDuration),
    [debouncedQuery, maxDuration],
  );
  const { data: baseData, isLoading: isBaseLoading } = usePresentations({
    enabled: isLoggedIn && needsBaseTotal,
  });
  const { data: filteredData, isLoading: isFilteredLoading } = usePresentationsWithFilters(params, {
    enabled: isLoggedIn,
  });

  const isLoading = isLoggedIn && ((needsBaseTotal ? isBaseLoading : false) || isFilteredLoading);
  const presentations = filteredData?.presentations ?? [];
  const totalCount = needsBaseTotal ? (baseData?.total ?? 0) : (filteredData?.total ?? 0);
  const filteredCount = filteredData?.total ?? 0;
  const isEmpty = !isLoading && totalCount === 0;

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
