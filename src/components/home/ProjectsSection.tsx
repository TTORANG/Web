import type { FilterMode, SortMode, ViewMode } from '@/types/home';
import type { Project } from '@/types/project';

import { CardView, ListView } from '../common';
import ProjectCard from '../projects/ProjectCard';
import { ProjectCardSkeleton } from '../projects/ProjectCardSkeleton';
import ProjectHeader from '../projects/ProjectHeader';
import ProjectList from '../projects/ProjectList';

const SKELETON_CARD_COUNT = 9;
const SKELETON_LIST_COUNT = 6;

type Props = {
  isLoading: boolean;
  totalCount: number;
  query: string;
  appliedQuery: string;
  onChangeQuery: (value: string) => void;
  sort: SortMode;
  onChangeSort: (value: SortMode) => void;
  filter: FilterMode;
  onChangeFilter: (value: FilterMode) => void;
  viewMode: ViewMode;
  onChangeViewMode: (value: ViewMode) => void;
  projects: Project[];
};

export default function ProjectsSection({
  isLoading,
  totalCount,
  query,
  appliedQuery,
  onChangeQuery,
  sort,
  onChangeSort,
  filter,
  onChangeFilter,
  viewMode,
  onChangeViewMode,
  projects,
}: Props) {
  /**
   * 검색어가 있는지 여부 (검색 모드인지 판단, 깜빡임 방지)
   */
  const hasAppliedQuery = appliedQuery.trim().length > 0;
  /**
   * 전체 프로젝트가 하나라도 존재하는지 여부
   * 아예 데이터가 없으면 ProjectSection 자체를 숨기기 위함
   */
  const hasAnyProjects = totalCount > 0;
  /**
   * 검색/필터 적용 후 결과가 존재하는지 여부 (appliedQuery 기준)
   *  -> 검색 성공 / 실패 UI 분기용
   */
  const hasResults = projects.length > 0;

  /**
   * 디바운싱 진행 중인지 여부 (입력값(query) != 적용값(appliedQuery))
   *  -> 결과/empty UI 깜빡임 방지용
   */
  const isDebouncing = query.trim() !== appliedQuery.trim();

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
        onChange={onChangeQuery}
        sort={sort}
        onChangeSort={onChangeSort}
        filter={filter}
        onChangeFilter={onChangeFilter}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
      />

      {isLoading ? (
        // 1. 로딩 중 -> 스켈레톤 UI
        viewMode === 'card' ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {Array.from({ length: SKELETON_LIST_COUNT }).map((_, index) => (
              // TODO
              // ㄴ ProjectListSkeleton도 따로?
              <div
                key={index}
                className="h-20 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse"
              />
            ))}
          </div>
        )
      ) : !isDebouncing && hasAppliedQuery && !hasResults ? (
        // 2. 검색 적용된 값이 있고, 결과가 없을 때에만 empty UI 표시
        <div className="flex items-center justify-center p-40">
          <p className="text-body-m text-gray-500">
            &apos;{appliedQuery}&apos;에 대한 검색 결과를 찾지 못했어요.
          </p>
        </div>
      ) : (
        /**
         * 3. 그 외의 경우
         *  - 검색어 없음 -> 전체 리스트
         *  - 검색어 있음 + 결과 있음 -> 결과 리스트
         */
        <div>
          {viewMode === 'card' ? (
            <CardView
              items={projects}
              getKey={(item) => item.id}
              className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
              renderCard={(item) => <ProjectCard {...item} highlightQuery={appliedQuery} />}
              empty={null}
            />
          ) : (
            <ListView
              items={projects}
              getKey={(item) => item.id}
              className="mt-6 flex flex-col gap-3"
              renderInfo={(item) => <ProjectList {...item} highlightQuery={appliedQuery} />}
              empty={null}
            />
          )}
        </div>
      )}
    </section>
  );
}
