import { useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';
import { getConversionStatus } from '@/api/endpoints/presentations';
import IntroSection from '@/components/home/IntroSection';
import PresentationsSection from '@/components/home/PresentationsSection';
import { usePresentations, usePresentationsWithFilters } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { useHomeFilter, useHomeQuery, useHomeSort } from '@/hooks/useHomeSelectors';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

const ACCEPTED_FILES_TYPES = '.pptx,.pdf';
// const MAX_SIZE_MB = 1_000; // 1GB
// const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function HomePage() {
  const queryClient = useQueryClient();
  const { uploadFile, cancelUpload, isUploading, progress, error } = useUploadFile();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = Boolean(accessToken);
  const [pendingThumbnailIds, setPendingThumbnailIds] = useState<string[]>([]);
  const pendingIdsRef = useRef<string[]>([]);
  const [thumbVersion, setThumvVersion] = useState<Record<string, number>>({});

  // 파일 업로드
  const onFileSelected = async (file: File) => {
    const response = await uploadFile({ file, title: file.name });

    if (response?.resultType === 'SUCCESS') {
      const projectId = response.success.projectId;
      setPendingThumbnailIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId]));
      showToast.success('업로드 완료!');
      void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
    }
  };

  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();

  // 디바운싱 300ms
  const debouncedQuery = useDebounce(query, 300);
  // 필터 (전체/3분이하/5분이하)
  const maxDuration = useMemo(() => {
    if (filter === null || filter === 'all') return undefined;
    if (filter === '3m') return 180;
    if (filter === '5m') return 300;
    return undefined;
  }, [filter]);

  // 정렬 (최신순/피드백많은순/가나다순)
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

  const isLoading = isLoggedIn && (isBaseLoading || isFilteredLoading);
  const presentations = filteredData?.presentations ?? [];
  const totalCount = needsBaseTotal ? (baseData?.total ?? 0) : (filteredData?.total ?? 0);
  const filteredCount = filteredData?.total ?? 0;
  const isEmpty = !isLoading && totalCount === 0;

  // pendingThumbnailIds 최신값을 ref에 동기화
  useEffect(() => {
    pendingIdsRef.current = pendingThumbnailIds;
  }, [pendingThumbnailIds]);
  useEffect(() => {
    if (pendingThumbnailIds.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const poll = async () => {
      const ids = pendingIdsRef.current;
      if (cancelled || ids.length === 0) return;

      const doneIds: string[] = [];

      await Promise.all(
        ids.map(async (id) => {
          try {
            const status = await getConversionStatus(id);
            const thumb = status.progress?.thumbnail ?? status.status;

            if (thumb === 'completed' || thumb === 'failed') {
              doneIds.push(id);
            }
          } catch {
            // 네트워크 오류면 다음 폴링 때 재시도
          }
        }),
      );

      if (cancelled) return;

      if (doneIds.length > 0) {
        setThumvVersion((prev) => {
          const next = { ...prev };
          doneIds.forEach((id) => {
            next[id] = (next[id] ?? 0) + 1; // 폴링에서 doneIds가 나오면 버전 증가
          });
          return next;
        });
        setPendingThumbnailIds((prev) => prev.filter((id) => !doneIds.includes(id)));
        void queryClient.invalidateQueries({ queryKey: queryKeys.presentations.lists() });
      }

      // 아직 남아있으면 다음 폴링 예약
      if (pendingIdsRef.current.length > 0) {
        timeoutId = setTimeout(poll, 3000);
      }
    };
    // 첫 폴링 시작
    timeoutId = setTimeout(poll, 3000);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pendingThumbnailIds]);

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
        pendingThumbnailIds={pendingThumbnailIds}
        thumbVersion={thumbVersion}
      />
    </main>
  );
}
