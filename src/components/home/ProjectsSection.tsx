import { useState } from 'react';

import type { ViewMode } from '@/types/home';
import type { ProjectItem } from '@/types/project';

import { CardView, Modal } from '../common';
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
  projects: ProjectItem[];
  viewMode: ViewMode;
  onChangeViewMode: (viewMode: ViewMode) => void;
};

export default function ProjectsSection({
  isLoading,
  query,
  onChangeQuery,
  projects,
  viewMode,
  onChangeViewMode,
}: Props) {
  const hasProjects = projects.length > 0;
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);

  if (!isLoading && !hasProjects) return null;

  return (
    <section className="mt-14">
      {/* 제목 */}
      <div className="mb-4">
        <h2 className="text-body-m-bold">내 발표</h2>
      </div>

      {/* 검색 */}
      <ProjectHeader
        value={query}
        onChange={onChangeQuery}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
      />

      {viewMode === 'card' ? (
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
            renderCard={(item) => (
              <ProjectCard item={item} onDeleteClick={(target) => setDeleteTarget(target)} />
            )}
          />
        )
      ) : isLoading ? (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: SKELETON_LIST_COUNT }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ProjectList items={projects} className="mt-6" onDeleteClick={setDeleteTarget} />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="발표 삭제"
        size="sm"
      >
        <div className="flex flex-col gap-1">
          <p className="text-body-m-bold">{deleteTarget?.title}</p>
          <p className="text-body-m">해당 발표를 정말 삭제하시겠습니까?</p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3 text-body-s">
          <button
            className="flex-1 rounded-lg bg-gray-200 py-3 text-main"
            type="button"
            onClick={() => setDeleteTarget(null)}
          >
            취소
          </button>
          <button
            className="flex-1 rounded-lg py-3 bg-main text-gray-100"
            type="button"
            onClick={() => {
              // TODO : 실제 삭제 호출 : deleteTarget?.id
              // 서버/스토어 붙이면 여기에서 mutation 호출하고 성공 시 목록 갱신
              setDeleteTarget(null);
            }}
          >
            삭제
          </button>
        </div>
      </Modal>
    </section>
  );
}
