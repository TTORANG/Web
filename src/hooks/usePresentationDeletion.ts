import { useState } from 'react';

import { showToast } from '@/utils/toast';

import { useDeletePresentation } from './queries/usePresentations';

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
