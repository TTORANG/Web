import type { SortMode, ViewMode } from '@/types/home';
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
  query: string;
  onChangeQuery: (value: string) => void;
  onChangeSort: (value: SortMode) => void;
  viewMode: ViewMode;
  onChangeViewMode: (value: ViewMode) => void;
  projects: Project[];
};

export default function ProjectsSection({
  isLoading,
  query,
  onChangeQuery,
  onChangeSort,
  viewMode,
  onChangeViewMode,
  projects,
}: Props) {
  const hasProjects = projects.length > 0;

  if (!isLoading && !hasProjects) return null;

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
        onChangeSort={onChangeSort}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
      />

      {viewMode === 'card' ? (
        // 카드로 보기
        isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <CardView
            items={projects}
            getKey={(item) => item.id}
            className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3"
            renderCard={(item) => <ProjectCard {...item} />}
          />
        )
      ) : // 리스트로 보기
      isLoading ? (
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
      ) : (
        <ListView
          items={projects}
          getKey={(item) => item.id}
          className="mt-6 flex flex-col gap-3"
          renderInfo={(item) => <ProjectList {...item} />}
        />
      )}
    </section>
  );
}
