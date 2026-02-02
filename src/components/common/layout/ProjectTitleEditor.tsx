/**
 * @file ProjectTitleEditor.tsx
 * @description 프로젝트 제목 편집 컴포넌트
 *
 * - 헤더에 프로젝트 제목 표시
 * - 클릭하면 Popover 열리고, 입력/저장 가능
 * - Enter 또는 저장 버튼으로 제출
 *

 */
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import { Popover } from '@/components/common/Popover';
import { useProject, useUpdateProject } from '@/hooks/queries/useProjects';
import { showToast } from '@/utils/toast';

export function ProjectTitleEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId ?? '');
  const { mutate: updateProject, isPending } = useUpdateProject();

  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 포커스/셀렉트는 DOM 조작이라 effect에서 해도 OK
    const t = window.setTimeout(() => {
      inputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(t);
  }, [isOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    // 열릴 때만 초기화 (닫힐 땐 굳이 초기화 X)
    if (nextOpen) {
      setTitle(project?.title ?? ''); // project가 아직 없으면 빈 값
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요');
      return;
    }

    if (!projectId) return;

    updateProject(
      { projectId, data: { title: trimmedTitle } },
      {
        onSuccess: () => {
          showToast.success('제목이 변경되었습니다');
          setIsOpen(false);
        },
        onError: () => {
          showToast.error('제목 변경에 실패했습니다');
        },
      },
    );
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      position="bottom"
      align="start"
      ariaLabel="발표 이름 변경"
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 max-w-md cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="발표 이름 변경"
        >
          {/* 표시용 텍스트는 서버 데이터(project.title)를 그대로 사용 */}
          <span className="text-body-m-bold text-gray-800 truncate">
            {project?.title ?? '내 발표'}
          </span>

          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-gray-800"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
    >
      {() => (
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-between gap-3 w-80 h-12 pl-5 pr-3 py-3 bg-white border border-gray-200 rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]"
        >
          <input
            ref={inputRef}
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            className={clsx(
              'flex-1 text-body-m-bold text-gray-800',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-400',
            )}
            placeholder="발표 제목을 입력하세요"
          />

          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              'px-3 py-1.5 text-caption-bold text-white bg-main rounded-full',
              'hover:bg-blue-600 transition-colors shrink-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </form>
      )}
    </Popover>
  );
}
