/**
 * @file PresentationTitleEditor.tsx
 * @description 프로젝트 제목 편집 컴포넌트
 *
 * - 헤더에 프로젝트 제목 표시
 * - 클릭하면 Popover 열리고, 입력/저장 가능
 * - Enter 또는 저장 버튼으로 제출
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import ArrowDownIcon from '@/assets/icons/icon-arrow-down.svg?react';
import { Popover } from '@/components/common/Popover';
import { usePresentation, useUpdatePresentation } from '@/hooks/queries/usePresentations';
import { showToast } from '@/utils/toast';

export function PresentationTitleEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: presentation } = usePresentation(projectId ?? '');
  const { mutate: updatePresentation, isPending } = useUpdatePresentation();

  const resolvedTitle = presentation?.title?.trim() ? presentation.title : '내 발표';
  const [editTitle, setEditTitle] = useState(resolvedTitle);

  useEffect(() => {
    setEditTitle(resolvedTitle);
  }, [resolvedTitle]);

  const handleSave = (close: () => void) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요');
      return;
    }

    if (!projectId) return;

    updatePresentation(
      { projectId, data: { title: trimmedTitle } },
      {
        onSuccess: () => {
          showToast.success('제목이 변경되었습니다');
          close();
        },
        onError: () => {
          showToast.error('제목 변경에 실패했습니다');
        },
      },
    );
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label="발표 이름 변경"
          className="inline-flex h-7 max-w-md items-center gap-1.5 rounded-md bg-transparent px-2 text-body-m-bold text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
        >
          <span className="truncate">{resolvedTitle}</span>
          <ArrowDownIcon
            className={clsx(
              'h-4 w-4 shrink-0 transition-transform duration-300',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      )}
      position="bottom"
      align="start"
      ariaLabel="발표 이름 변경"
      className="flex w-80 items-center gap-2 border border-gray-200 px-3 py-2"
    >
      {({ close }) => (
        <>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave(close);
              }
            }}
            disabled={isPending}
            aria-label="발표 이름"
            placeholder="발표 제목을 입력하세요"
            className={clsx(
              'h-9 flex-1 rounded-md border border-gray-200 px-3 text-sm text-gray-800 outline-none',
              'focus:border-main focus-visible:outline-2 focus-visible:outline-main',
              'placeholder:text-gray-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />
          <button
            type="button"
            onClick={() => handleSave(close)}
            disabled={isPending}
            className={clsx(
              'h-9 rounded-full bg-main px-3 text-sm font-semibold text-white',
              'hover:bg-blue-600 active:bg-main-variant2 transition-colors',
              'focus-visible:outline-2 focus-visible:outline-main',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </>
      )}
    </Popover>
  );
}
