import { useEffect, useState } from 'react';

import { useUpdatePresentation } from '@/hooks/queries/usePresentations';
import { showToast } from '@/utils/toast';

type BaseRenameOptions = {
  initialTitle: string;
  successMessage?: string;
  errorMessage?: string;
};

type PresentationRenameOptions = BaseRenameOptions & {
  projectId: string;
  onConfirmRename?: undefined;
};

type ExternalRenameOptions = BaseRenameOptions & {
  onConfirmRename: (title: string) => Promise<void>;
  projectId?: undefined;
};

type UseRenameOptions = PresentationRenameOptions | ExternalRenameOptions;

const hasExternalRenameHandler = (options: UseRenameOptions): options is ExternalRenameOptions =>
  typeof options.onConfirmRename === 'function';

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
  confirmRename: () => Promise<void>;
}

/**
 * 프로젝트 이름 변경 공통 훅
 *
 * @param options - projectId 기반 변경 또는 외부 변경 핸들러
 * @returns 이름 변경에 필요한 상태와 핸들러
 */
export function useRename(options: UseRenameOptions): UseRenameReturn {
  const { mutateAsync: updatePresentation, isPending: isPresentationPending } =
    useUpdatePresentation();
  const { initialTitle, successMessage, errorMessage } = options;

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [confirmedTitle, setConfirmedTitle] = useState(initialTitle);
  const [isExternalPending, setIsExternalPending] = useState(false);

  useEffect(() => {
    setConfirmedTitle(initialTitle);
    setNewTitle(initialTitle);
  }, [initialTitle]);

  const isPending = isPresentationPending || isExternalPending;

  const openRenameModal = () => {
    setNewTitle(confirmedTitle);
    setIsRenameModalOpen(true);
  };

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
    setNewTitle(confirmedTitle);
  };

  const confirmRename = async () => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요.');
      return;
    }

    if (trimmedTitle === confirmedTitle) {
      setIsRenameModalOpen(false);
      return;
    }

    const isExternalRename = hasExternalRenameHandler(options);

    try {
      if (isExternalRename) {
        setIsExternalPending(true);
        await options.onConfirmRename(trimmedTitle);
      } else {
        await updatePresentation({ projectId: options.projectId, data: { title: trimmedTitle } });
      }

      showToast.success(successMessage ?? '제목을 변경했습니다.');
      setConfirmedTitle(trimmedTitle);
      setIsRenameModalOpen(false);
    } catch {
      showToast.error(errorMessage ?? '제목을 변경하지 못했습니다.');
    } finally {
      if (isExternalRename) {
        setIsExternalPending(false);
      }
    }
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
