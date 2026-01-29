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
   * 검색어가 있는지 여부 (검색 모드인지 판단)
   */
  const hasQuery = query.trim().length > 0;
  /**
   * 전체 프로젝트가 하나라도 존재하는지 여부
   * 아예 데이터가 없으면 ProjectSection 자체를 숨기기 위함
   */
  const hasAnyProjects = totalCount > 0;
  /**
   * 검색/필터 적용 후 결과가 존재하는지 여부
   *  -> 검색 성공 / 실패 UI 분기용
   */
  const hasResults = projects.length > 0;

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
      ) : hasQuery && !hasResults ? (
        // 2. 검색어는 있지만 결과가 없는 경우 -> '검색 결과 없음'
        <div className=" flex items-center justify-center mt-10">
          <p className="text-body-m text-gray-500">
            &apos;{query}&apos;(으)로 검색한 결과가 존재하지 않습니다.
          </p>
        </div>
      ) : (
        /**
         * 3. 그 외의 경우
         *  - 검색어 없음 -> 전체 리스트
         *  - 검색어 있음 + 결과 있음 -> 결과 리스트
         */
        <div>
          {/* 검색어가 있을 때에만 검색 결과 안내 문구 표시 */}
          {hasQuery && (
            <p className="ml-3 mt-3 text-body-s text-gray-700">
              &apos;{query}&apos;(으)로 검색한 결과를 {projects.length}개 찾았습니다.
            </p>
          )}

          {viewMode === 'card' ? (
            <CardView
              items={projects}
              getKey={(item) => item.id}
              className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
              renderCard={(item) => <ProjectCard {...item} highlightQuery={query} />}
            />
          ) : (
            <ListView
              items={projects}
              getKey={(item) => item.id}
              className="mt-6 flex flex-col gap-3"
              renderInfo={(item) => <ProjectList {...item} highlightQuery={query} />}
            />
          )}
        </div>
      )}
    </section>
  );
}
