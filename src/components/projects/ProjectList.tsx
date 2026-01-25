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

import { Modal } from '../common';
import { Dropdown, type DropdownItem } from '../common/Dropdown';

export default function ProjectList({
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

  const handleListClick = () => {
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
        onClick={handleListClick}
        className="flex w-full items-center gap-4 cursor-pointer bg-white px-5 py-3 rounded-2xl border-gray-200 transition-shadow hover:shadow-lg"
      >
        {/* 썸네일 */}
        <div className="h-18 w-32 overflow-hidden rounded-sm bg-gray-200">
          {thumbnailUrl && (
            <img className="h-full w-full object-cover" src={thumbnailUrl} alt={`${title}`} />
          )}
        </div>

        {/* 본문 */}
        <div className="min-w-0 flex-1">
          {/* 제목 */}
          <div className="truncate text-body-m-bold text-gray-900">{title}</div>

          {/* 날짜 | 페이지 수 + 댓글/이모티콘/조회 */}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-gray-500">
            <div className="flex items-center gap-3">
              <span>{formatRelativeTime(updatedAt)}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <PageCountIcon />
                {pageCount} 페이지
              </span>
            </div>

            <div className="flex items-center gap-3 text-caption text-gray-500">
              <span className="flex items-center gap-1">
                <CommentCountIcon />
                {commentCount}
              </span>
              <span className="flex items-center gap-1">
                <ReactionCountIcon />
                {reactionCount}
              </span>
              <span className="flex items-center gap-1">
                <ViewCountIcon />
                {viewCount}
              </span>
            </div>
          </div>
        </div>

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
