import { useState } from 'react';

import { useUpdatePresentation } from '@/hooks/queries/usePresentations';
import { showToast } from '@/utils/toast';

interface UseRenameOptions {
  projectId: string;
  initialTitle: string;
}

interface UseRenameReturn {
  /** 이름 변경 모달 열림 여부 */
  isRenameModalOpen: boolean;
  /** 업데이트 진행 중 여부 */
  isPending: boolean;
  /** 현재 표시할 제목 (수정 성공 시 새 제목 반영) */
  displayTitle: string;
  /** 입력 중인 새 제목 */
  newTitle: string;
  /** 새 제목 변경 핸들러 */
  setNewTitle: (title: string) => void;
  /** 이름 변경 모달 열기 */
  openRenameModal: () => void;
  /** 이름 변경 모달 닫기 */
  closeRenameModal: () => void;
  /** 이름 변경 확인 */
  confirmRename: () => void;
}

/**
 * 프로젝트 이름 변경 공통 훅
 *
 * @param options - projectId와 initialTitle
 * @returns 이름 변경에 필요한 상태와 핸들러
 */
export function useRename({ projectId, initialTitle }: UseRenameOptions): UseRenameReturn {
  const { mutate: updatePresentation, isPending } = useUpdatePresentation();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(initialTitle);
  // 로컬에서 성공적으로 변경된 제목을 추적 (즉시 UI 반영용)
  const [confirmedTitle, setConfirmedTitle] = useState(initialTitle);

  const openRenameModal = () => {
    setNewTitle(confirmedTitle);
    setIsRenameModalOpen(true);
  };

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    setNewTitle(confirmedTitle);
  };

  const confirmRename = () => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요');
      return;
    }

    if (trimmedTitle === confirmedTitle) {
      setIsRenameModalOpen(false);
      return;
    }

    updatePresentation(
      { projectId, data: { title: trimmedTitle } },
      {
        onSuccess: () => {
          showToast.success('제목이 변경되었습니다');
          setConfirmedTitle(trimmedTitle);
          setIsRenameModalOpen(false);
        },
        onError: () => {
          showToast.error('제목 변경에 실패했습니다');
        },
      },
    );
  };

  return {
    isRenameModalOpen,
    isPending,
    displayTitle: confirmedTitle,
    newTitle,
    setNewTitle,
    openRenameModal,
    closeRenameModal,
    confirmRename,
  };
}
