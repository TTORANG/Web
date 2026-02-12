import { useEffect, useMemo, useState } from 'react';

import {
  useHomeActions,
  useHomeFilter,
  useHomeQuery,
  useHomeSort,
  useHomeViewMode,
} from '@/hooks/useHomeSelectors';
import type { Presentation } from '@/types/presentation';

import { CardView, ListView } from '../common';
import PresentationCard from '../presentation/PresentationCard';
import PresentationHeader from '../presentation/PresentationHeader';
import PresentationList from '../presentation/PresentationList';

const SKELETON_CARD_COUNT = 3;
const SKELETON_LIST_COUNT = 3;

type Props = {
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
  appliedQuery: string;
  presentations: Presentation[];
  pendingThumbnailIds: string[];
  thumbVersion: Record<string, number>;
};

export default function PresentationsSection({
  isLoading,
  totalCount,
  filteredCount,
  appliedQuery,
  presentations,
  pendingThumbnailIds,
  thumbVersion,
}: Props) {
  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();
  const viewMode = useHomeViewMode();
  const { setQuery, setSort, setFilter, setViewMode } = useHomeActions();
  const pendingSet = useMemo(() => new Set(pendingThumbnailIds), [pendingThumbnailIds]);

  /**
   * 전체 프로젝트가 하나라도 존재하는지 여부
   * - 아예 데이터가 없고 검색어가 없는 경우에만 PresentationSection 자체를 숨깁니다.
   *   (검색 중에는 섹션이 깜빡이지 않도록 유지)
   */
  const hasAnyPresentations = totalCount > 0;

  /**
   * 디바운싱 진행 중인지 여부 (입력값(query) != 적용값(appliedQuery))
   *  -> 결과/empty UI 깜빡임 방지용
   */
  const isDebouncing = query.trim() !== appliedQuery.trim();

  // 검색어가 있는지 여부 (검색 모드인지 판단, 깜빡임 방지)
  const hasAppliedQuery = appliedQuery.trim().length > 0;

  // 사용자가 입력 중인지
  const hasTypedQuery = query.trim().length > 0;

  // 필터 결과 유무 (검색과 무관)
  const hasFilteredResults = filteredCount > 0;

  // 마지막 저장된 결과(디바운스 끝난 appliedQuery 기준 결과)를 저장
  const [lastSavedPresentations, setLastSavedPresentations] =
    useState<Presentation[]>(presentations);

  // 디바운싱 중이면 이전 결과 유지
  const displayPresentations = isDebouncing ? lastSavedPresentations : presentations;

  // empty 판단용(보여주는 기준(displayPresentations))
  const hasDisplayResults = displayPresentations.length > 0;

  // 디바운스가 끝난 순간에만 안정된 결과를 갱신
  useEffect(() => {
    if (!isDebouncing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSavedPresentations(presentations);
    }
  }, [isDebouncing, presentations]);

  /**
   * 전체 프로젝트가 아예 없을 때
   * - 검색어(appliedQuery)가 없고 로딩이 끝난 상태라면 섹션을 숨깁니다.
   * - 검색어가 있는 경우(또는 디바운싱 중)에는 섹션을 유지하여 깜빡임을 방지합니다.
   */
  if (!isLoading && !hasAnyPresentations && !hasAppliedQuery && !hasTypedQuery) return null;

  const hasActiveFilters = filter !== null && filter !== 'all';

  return (
    <section className="mt-14">
      {/* 제목 */}
      <div className="mb-4">
        <h2 className="text-body-m-bold">내 발표</h2>
      </div>

      {/* 검색 및 필터 */}
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

      {isLoading ? (
        // 1. 로딩 중 -> 스켈레톤 UI
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
      ) : !isDebouncing && hasAppliedQuery && !hasDisplayResults ? (
        // 2. (검색) 검색 적용된 값이 있고, 결과가 없을 때에만 검색용 empty UI 표시
        <div className="flex items-center justify-center p-40">
          <p className="text-body-m text-gray-500">
            &apos;{appliedQuery}&apos;에 대한 검색 결과를 찾지 못했어요.
          </p>
        </div>
      ) : !isDebouncing && hasActiveFilters && !hasFilteredResults ? (
        // 3. 필터 결과가 0개
        <div className="flex items-center justify-center p-40">
          <p className="text-body-m text-gray-500">선택한 필터에 맞는 발표를 찾지 못했어요.</p>
        </div>
      ) : (
        // 4. 그 외의 경우 -> 리스트 렌더
        <div>
          {viewMode === 'card' ? (
            <CardView
              items={displayPresentations}
              getKey={(item) => item.projectId}
              className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
              renderCard={(item) => (
                <PresentationCard
                  {...item}
                  highlightQuery={appliedQuery}
                  isPresentationPending={pendingSet.has(item.projectId) || !item.thumbnailUrl}
                  thumbnailVersion={thumbVersion[item.projectId] ?? 0}
                />
              )}
              empty={null}
            />
          ) : (
            <ListView
              items={displayPresentations}
              getKey={(item) => item.projectId}
              className="mt-6 flex flex-col gap-3"
              renderInfo={(item) => (
                <PresentationList
                  {...item}
                  highlightQuery={appliedQuery}
                  isPresentationPending={pendingSet.has(item.projectId) || !item.thumbnailUrl}
                  thumbnailVersion={thumbVersion[item.projectId] ?? 0}
                />
              )}
              empty={null}
            />
          )}
        </div>
      )}
    </section>
  );
}
