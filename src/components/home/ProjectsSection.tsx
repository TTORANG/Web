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
  // 전체 데이터 존재 여부
  const hasAnyProjects = totalCount > 0;
  // 검색/필터 결과 존재 여부
  const hasResults = projects.length > 0;

  // 전체 프로젝트가 아예 없을 때에만 ProjectSection을 숨김
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
      ) : !hasResults ? (
        // 검색/필터 결과가 0개일 때 '결과 없음'
        <div className=" flex items-center justify-center mt-10">
          <p className="text-body-m text-gray-500">검색/필터 결과가 없습니다.</p>
        </div>
      ) : viewMode === 'card' ? (
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
    </section>
  );
}
