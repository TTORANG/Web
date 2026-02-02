import { useEffect, useState } from 'react';

import {
  useHomeActions,
  useHomeFilter,
  useHomeQuery,
  useHomeSort,
  useHomeViewMode,
} from '@/hooks/useHomeSelectors';
import type { Project } from '@/types/project';

import { CardView, ListView } from '../common';
import ProjectCard from '../projects/ProjectCard';
import ProjectHeader from '../projects/ProjectHeader';
import ProjectList from '../projects/ProjectList';

const SKELETON_CARD_COUNT = 9;
const SKELETON_LIST_COUNT = 6;

type Props = {
  isLoading: boolean;
  totalCount: number;
  filteredCount: number;
  appliedQuery: string;
  projects: Project[];
};

export default function ProjectsSection({
  isLoading,
  totalCount,
  filteredCount,
  appliedQuery,
  projects,
}: Props) {
  const query = useHomeQuery();
  const sort = useHomeSort();
  const filter = useHomeFilter();
  const viewMode = useHomeViewMode();
  const { setQuery, setSort, setFilter, setViewMode } = useHomeActions();

  /**
   * 전체 프로젝트가 하나라도 존재하는지 여부
   * 아예 데이터가 없으면 ProjectSection 자체를 숨기기 위함
   */
  const hasAnyProjects = totalCount > 0;

  /**
   * 디바운싱 진행 중인지 여부 (입력값(query) != 적용값(appliedQuery))
   *  -> 결과/empty UI 깜빡임 방지용
   */
  const isDebouncing = query.trim() !== appliedQuery.trim();

  // 검색어가 있는지 여부 (검색 모드인지 판단, 깜빡임 방지)
  const hasAppliedQuery = appliedQuery.trim().length > 0;

  // 필터 결과 유무 (검색과 무관)
  const hasFilterResults = filteredCount > 0;

  // 마지막 저장된 결과(디바운스 끝난 appliedQuery 기준 결과)를 저장
  const [lastSavedProjects, setLastSavedProjects] = useState<Project[]>(projects);

  // 디바운싱 중이면 이전 결과 유지
  const displayProjects = isDebouncing ? lastSavedProjects : projects;

  // empty 판단용(보여주는 기준(displayProjects))
  const hasDisplayResults = displayProjects.length > 0;

  // 디바운스가 끝난 순간에만 안정된 결과를 갱신
  useEffect(() => {
    if (!isDebouncing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSavedProjects(projects);
    }
  }, [isDebouncing, projects]);

  /**
   * 전체 프로젝트가 아예 없을 때는
   * 검색/필터 여부와 상관 없이 ProjectSection 자체를 렌더링하지 않음
   */
  if (!isLoading && !hasAnyProjects) return null;

  return (
    <section className="mt-14">
      {/* 제목 */}
      <div className="mb-4">
        <h2 className="text-body-m-bold">내 발표</h2>
      </div>

      {/* 검색 및 필터 */}
      <ProjectHeader
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
              <ProjectCard.Skeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {Array.from({ length: SKELETON_LIST_COUNT }).map((_, index) => (
              <ProjectList.Skeleton key={index} />
            ))}
          </div>
        )
      ) : !isDebouncing && !hasFilterResults ? (
        // 2. 필터 결과가 0개
        <div className="flex items-center justify-center p-40">
          <p className="text-body-m text-gray-500">선택한 필터에 맞는 발표를 찾지 못했어요.</p>
        </div>
      ) : !isDebouncing && hasAppliedQuery && !hasDisplayResults ? (
        // 3. 검색 적용된 값이 있고, 결과가 없을 때에만 empty UI 표시
        <div className="flex items-center justify-center p-40">
          <p className="text-body-m text-gray-500">
            &apos;{appliedQuery}&apos;에 대한 검색 결과를 찾지 못했어요.
          </p>
        </div>
      ) : (
        // 4. 그 외의 경우 -> 리스트 렌더
        <div>
          {viewMode === 'card' ? (
            <CardView
              items={displayProjects}
              getKey={(item) => item.id}
              className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
              renderCard={(item) => <ProjectCard {...item} />}
              empty={null}
            />
          ) : (
            <ListView
              items={displayProjects}
              getKey={(item) => item.id}
              className="mt-6 flex flex-col gap-3"
              renderInfo={(item) => <ProjectList {...item} />}
              empty={null}
            />
          )}
        </div>
      )}
    </section>
  );
}
