import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';
import { getTabPath } from '@/constants/navigation';
import { useDeleteProject } from '@/hooks/queries/useProjects';
import type { Project } from '@/types/project';
import { formatRelativeTime } from '@/utils/format';
import { showToast } from '@/utils/toast';

import { Dropdown, Modal } from '../common';
import type { DropdownItem } from '../common/Dropdown';

export default function ProjectCard({
  id,
  title,
  updatedAt,
  pageCount,
  commentCount,
  reactionCount,
  viewCount = 0,
  thumbnailUrl,
}: Project) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate: deleteProject, isPending } = useDeleteProject();

  // 프로젝트 더보기 드롭다운 중 삭제 클릭
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  // 삭제 모달 안에서 삭제 클릭
  const handleConfirmDelete = () => {
    deleteProject(id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        showToast.success('삭제 완료', '발표가 삭제되었습니다.');
      },
    });
  };

  const handleCardClick = () => {
    navigate(getTabPath(id, 'slide'));
  };

  const dropdownItems: DropdownItem[] = [
    {
      id: 'rename',
      label: '이름 변경',
      onClick: () => {
        // TODO: 이름 변경 로직 구현
      },
    },
    {
      id: 'delete',
      label: '삭제',
      variant: 'danger',
      onClick: handleDeleteClick,
    },
  ];

  return (
    <>
      <article
        onClick={handleCardClick}
        className="cursor-pointer rounded-2xl border-none bg-white transition-shadow hover:shadow-lg"
      >
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200">
          {thumbnailUrl && (
            <img
              className="h-full w-full object-contain outline-none"
              src={thumbnailUrl}
              alt={`${title}`}
            />
          )}
        </div>

        <div className="p-4">
          {/* 제목 및 업데이트 날짜 */}
          <div className="flex items-center justify-between">
            <h3 className="text-body-m-bold text-gray-800">{title}</h3>
            {/* 더보기 */}
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                trigger={({ isOpen }) => (
                  <MoreIcon className={clsx(isOpen ? 'text-main' : 'text-gray-400')} />
                )}
                items={dropdownItems}
                position="bottom"
                align="end"
                ariaLabel="더보기"
                menuClassName="w-32"
              />
            </div>
          </div>
          <p className="mt-1 text-body-s text-gray-400">{formatRelativeTime(updatedAt)}</p>

          <div className="mt-5 flex items-center justify-between gap-3 text-caption text-gray-400">
            <div className="flex gap-1">
              <PageCountIcon />
              <span>{pageCount} 페이지</span>
            </div>

            {/* 반응 모음 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CommentCountIcon />
                {commentCount}
              </div>
              <div className="flex items-center gap-1">
                <ReactionCountIcon />
                {reactionCount}
              </div>
              <div className="flex items-center gap-1">
                <ViewCountIcon />
                {viewCount}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      <div onClick={(e) => e.stopPropagation()}>
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="발표 삭제"
          size="sm"
          closeOnBackdropClick={!isPending}
          closeOnEscape={!isPending}
        >
          <div className="flex flex-col gap-1">
            <p className="text-body-m-bold">{title}</p>
            <p className="text-body-m">발표를 정말 삭제하시겠습니까?</p>
          </div>
          <div className="flex items-center justify-center text-body-s gap-3 mt-7">
            <button
              className="border border-none rounded-lg flex-1 py-3 bg-gray-200 text-main cursor-pointer "
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              취소
            </button>
            <button
              className="border border-none rounded-lg flex-1 py-3 bg-main text-gray-100 cursor-pointer "
              type="button"
              onClick={handleConfirmDelete}
            >
              {isPending ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
