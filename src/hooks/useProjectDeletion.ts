import { useState } from 'react';

import { showToast } from '@/utils/toast';

import { useDeleteProject } from './queries/useProjects';

export function useProjectDeletion(projectId: string) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate, isPending } = useDeleteProject();

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
