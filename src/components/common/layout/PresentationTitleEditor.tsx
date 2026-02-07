/**
 * @file PresentationTitleEditor.tsx
 * @description 프로젝트 제목 편집 컴포넌트
 *
 * - 헤더에 프로젝트 제목 표시
 * - 클릭하면 Popover 열리고, 입력/저장 가능
 * - Enter 또는 저장 버튼으로 제출
 */
import { useParams } from 'react-router-dom';

import { usePresentation, useUpdatePresentation } from '@/hooks/queries/usePresentations';
import { showToast } from '@/utils/toast';

import { TitleEditorPopover } from '../TitleEditorPopover';

interface PresentationTitleEditorProps {
  readOnlyContent?: React.ReactNode;
}

export function PresentationTitleEditor({ readOnlyContent }: PresentationTitleEditorProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: presentation } = usePresentation(projectId ?? '');
  const { mutate: updatePresentation, isPending } = useUpdatePresentation();

  const resolvedTitle = presentation?.title?.trim() ? presentation.title : '내 발표';

  const handleSave = (newTitle: string, close: () => void) => {
    const trimmedTitle = newTitle.trim();
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
    <TitleEditorPopover
      title={resolvedTitle}
      onSave={handleSave}
      readOnlyContent={readOnlyContent}
      ariaLabel="발표 이름 변경"
      isPending={isPending}
    />
  );
}
