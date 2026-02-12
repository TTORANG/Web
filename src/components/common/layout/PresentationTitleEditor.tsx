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
  title?: string;
}

export function PresentationTitleEditor({ readOnlyContent, title }: PresentationTitleEditorProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: presentation } = usePresentation(projectId ?? '');

  const resolvedTitle = title || (presentation?.title?.trim() ? presentation.title : '내 발표');

  if (readOnlyContent) {
    return (
      <TitleEditorPopover
        title={resolvedTitle}
        readOnlyContent={readOnlyContent}
        ariaLabel="발표 정보"
      />
    );
  }

  return <PresentationTitleEditorEditable projectId={projectId} title={resolvedTitle} />;
}

function PresentationTitleEditorEditable({
  projectId,
  title,
}: {
  projectId?: string;
  title: string;
}) {
  const { mutate: updatePresentation, isPending } = useUpdatePresentation();

  const handleSave = (newTitle: string, close: () => void) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      showToast.error('제목을 입력해주세요.');
      return;
    }

    if (!projectId) return;

    updatePresentation(
      { projectId, data: { title: trimmedTitle } },
      {
        onSuccess: () => {
          showToast.success('제목을 변경했습니다.');
          close();
        },
        onError: () => {
          showToast.error('제목을 변경하지 못했습니다.');
        },
      },
    );
  };

  return (
    <TitleEditorPopover
      title={title}
      onSave={handleSave}
      ariaLabel="발표 이름 변경"
      isPending={isPending}
    />
  );
}
