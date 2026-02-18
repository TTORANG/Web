import { type ChangeEvent, useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ProjectScriptItemDto } from '@/api/dto';
import { useBulkEditScripts, useProjectScripts } from '@/hooks/queries/useScript';
import { useSlides } from '@/hooks/queries/useSlides';
import type { SlideListItem } from '@/types/slide';
import { showToast } from '@/utils/toast';

const normalizeTxt = (text: string) => text.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n');

const parseParagraphsFromTxt = (text: string) =>
  normalizeTxt(text)
    .split(/\n(?:[ \t]*\n)+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

export interface ScriptBulkEditPreviewItem {
  slide: SlideListItem;
  index: number;
  script: string;
}

const buildScriptMap = (scripts: ProjectScriptItemDto[] | undefined) => {
  return new Map((scripts ?? []).map((item) => [item.slideId, item.scriptText]));
};

export function useScriptBulkEdit() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: slides } = useSlides(projectId ?? '');
  const {
    data: projectScripts,
    refetch: refetchProjectScripts,
    isFetching: isProjectScriptsFetching,
  } = useProjectScripts(projectId ?? '');

  const { mutateAsync: bulkEditScripts, isPending: isSaving } = useBulkEditScripts();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined);
  const [previewItems, setPreviewItems] = useState<ScriptBulkEditPreviewItem[]>([]);
  const [isPreparingModal, setIsPreparingModal] = useState(false);

  const resetFileInput = () => {
    setSelectedFileName(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setDraftFromSource = useCallback(
    (scripts: ProjectScriptItemDto[] | undefined) => {
      const scriptMap = buildScriptMap(scripts);
      const nextPreviewItems: ScriptBulkEditPreviewItem[] = (slides ?? []).map((slide, index) => ({
        slide,
        index,
        script: scriptMap.get(slide.slideId) ?? '',
      }));
      setPreviewItems(nextPreviewItems);
    },
    [slides],
  );

  const handleOpenModal = async () => {
    if (!projectId || isSaving) return;
    if (!slides) {
      showToast.error('슬라이드 정보를 불러오는 중입니다.', '잠시 후 다시 시도해주세요.');
      return;
    }

    setIsModalOpen(true);
    resetFileInput();
    setIsPreparingModal(true);

    try {
      const response = await refetchProjectScripts();
      setDraftFromSource(response.data?.scripts ?? projectScripts?.scripts);
    } catch {
      setDraftFromSource(projectScripts?.scripts);
      showToast.error(
        '최신 대본을 불러오지 못했습니다.',
        '현재 조회된 대본으로 일괄 수정을 진행합니다.',
      );
    } finally {
      setIsPreparingModal(false);
    }
  };

  const handleCloseModal = () => {
    if (isSaving || isPreparingModal) return;

    setIsModalOpen(false);
    setPreviewItems([]);
    resetFileInput();
  };

  const handleOpenFilePicker = () => {
    if (!isModalOpen || isSaving) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const mimeType = (file.type || '').toLowerCase();
    const isTxtFile = file.name.toLowerCase().endsWith('.txt') || mimeType.startsWith('text/plain');

    if (!isTxtFile) {
      showToast.error('txt 파일만 업로드할 수 있습니다.');
      resetFileInput();
      return;
    }

    if (previewItems.length < 1) {
      showToast.error('대본이 준비된 뒤 파일을 불러와주세요.');
      resetFileInput();
      return;
    }

    try {
      const text = await file.text();
      const paragraphs = parseParagraphsFromTxt(text);

      if (paragraphs.length < 1) {
        showToast.error('유효한 문단이 없습니다.', 'TXT 내용을 확인해주세요.');
        resetFileInput();
        return;
      }

      setSelectedFileName(file.name);
      setPreviewItems((prev) =>
        prev.map((item, index) => ({
          ...item,
          script: paragraphs[index] ?? item.script,
        })),
      );
    } catch {
      showToast.error('TXT 파일을 읽지 못했습니다.', '다시 시도해주세요.');
      resetFileInput();
    }
  };

  const handlePreviewScriptChange = (index: number, value: string) => {
    setPreviewItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, script: value } : item)),
    );
  };

  const handleSaveBulkEdit = async () => {
    if (!projectId) {
      showToast.error('프로젝트 정보를 찾을 수 없습니다.');
      return;
    }

    if (previewItems.length < 1) {
      showToast.error('저장할 대본이 없습니다.');
      return;
    }

    try {
      const result = await bulkEditScripts({
        projectId,
        data: {
          scripts: previewItems.map((item) => ({
            slideId: item.slide.slideId,
            scriptText: item.script,
          })),
        },
      });

      showToast.success(
        '대본 일괄 수정을 완료했습니다.',
        `반영 ${result.updatedSlideCount}개 · 동일 ${result.unchangedSlideCount}개`,
      );

      setIsModalOpen(false);
      setPreviewItems([]);
      resetFileInput();
    } catch {
      showToast.error('대본 일괄 수정에 실패했습니다.', '다시 시도해주세요.');
    }
  };

  return {
    projectId,
    fileInputRef,
    isModalOpen,
    isSaving,
    isPreparingModal: isPreparingModal || (isModalOpen && isProjectScriptsFetching),
    selectedFileName,
    previewItems,
    handleOpenModal,
    handleCloseModal,
    handleOpenFilePicker,
    handleFileChange,
    handlePreviewScriptChange,
    handleSaveBulkEdit,
  };
}
