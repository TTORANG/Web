import { useState } from 'react';

import { showToast } from '@/utils/toast';

import { useDeletePresentation } from './queries/usePresentations';

/**
 * 프로젝트 삭제 훅
 *
 * 삭제 확인 모달 상태와 삭제 실행 로직을 캡슐화합니다.
 *
 * @param projectId - 삭제할 프로젝트 ID
 * @returns isDeleteModalOpen - 삭제 모달 열림 여부
 * @returns openDeleteModal - 삭제 모달 열기
 * @returns closeDeleteModal - 삭제 모달 닫기
 * @returns confirmDelete - 삭제 확인 (API 호출)
 * @returns isPending - 삭제 진행 중 여부
 */
export function usePresentationDeletion(projectId: string) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate, isPending } = useDeletePresentation();

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const confirmDelete = () => {
    mutate(projectId, {
      onSuccess: () => {
        closeDeleteModal();
        showToast.success('삭제 완료', '발표가 삭제되었습니다.');
      },
    });
  };
  return {
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    isPending,
  };
}
