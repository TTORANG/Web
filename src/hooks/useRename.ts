import { type FormEvent, useRef, useState } from 'react';

import { useUpdateProject } from '@/hooks/queries/useProjects';
import { showToast } from '@/utils/toast';

interface UseRenameOptions {
  projectId: string;
  initialTitle: string;
}

interface UseRenameReturn {
  /** 이름 변경 모드 여부 */
  isRenaming: boolean;
  /** 업데이트 진행 중 여부 */
  isUpdating: boolean;
  /** 현재 표시할 제목 (수정 성공 시 새 제목 반영) */
  displayTitle: string;
  /** 입력 중인 새 제목 */
  newTitle: string;
  /** 새 제목 변경 핸들러 */
  setNewTitle: (title: string) => void;
  /** 입력 필드 ref */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** 이름 변경 시작 */
  startRenaming: () => void;
  /** 폼 제출 핸들러 */
  handleSubmit: (e: FormEvent) => void;
  /** 이름 변경 취소 */
  cancelRenaming: () => void;
}

/**
 * 프로젝트 이름 변경 공통 훅
 *
 * @param options - projectId와 initialTitle
 * @returns 이름 변경에 필요한 상태와 핸들러
 */
export function useRename({ projectId, initialTitle }: UseRenameOptions): UseRenameReturn {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(initialTitle);
  // 로컬에서 성공적으로 변경된 제목을 추적 (즉시 UI 반영용)
  const [confirmedTitle, setConfirmedTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRenaming = () => {
    setIsRenaming(true);
    setNewTitle(confirmedTitle);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요');
      return;
    }

    if (trimmedTitle === confirmedTitle) {
      setIsRenaming(false);
      return;
    }

    updateProject(
      { projectId, data: { title: trimmedTitle } },
      {
        onSuccess: () => {
          showToast.success('제목이 변경되었습니다');
          setConfirmedTitle(trimmedTitle); // 로컬 상태 즉시 업데이트
          setIsRenaming(false);
        },
        onError: () => {
          showToast.error('제목 변경에 실패했습니다');
        },
      },
    );
  };

  const cancelRenaming = () => {
    setIsRenaming(false);
    setNewTitle(confirmedTitle);
  };

  return {
    isRenaming,
    isUpdating,
    displayTitle: confirmedTitle,
    newTitle,
    setNewTitle,
    inputRef,
    startRenaming,
    handleSubmit,
    cancelRenaming,
  };
}
