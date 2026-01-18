import type { CardItems } from '@/types/project';

import ProjectCard from '../projects/ProjectCard';
import { ProjectCardSkeleton } from '../projects/ProjectCardSkeleton';
import ProjectHeader from '../projects/ProjectHeader';

const SKELETON_CARD_COUNT = 9;

type Props = {
  isLoading: boolean;
  query: string;
  onChangeQuery: (value: string) => void;
  projects: CardItems[];
};

export default function ProjectsSection({ isLoading, query, onChangeQuery, projects }: Props) {
  const hasProjects = projects.length > 0;

  if (!isLoading && !hasProjects) return null;

  return (
    <section className="mt-14">
      {/* 제목 */}
      <div className="mb-4">
        <h2 className="text-body-m-bold">내 발표</h2>
      </div>

      {/* 검색 */}
      <ProjectHeader value={query} onChange={onChangeQuery} />

      {/* 프레젠테이션 목록 */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))
          : projects.map((project) => <ProjectCard key={project.id} {...project} />)}
      </div>
    </section>
  );
}
