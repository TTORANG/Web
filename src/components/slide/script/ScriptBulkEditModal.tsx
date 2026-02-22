import { useMemo } from 'react';
import type { ChangeEvent, RefObject } from 'react';

import UploadIcon from '@/assets/icons/icon-upload.svg?react';
import { Modal, SlideImage } from '@/components/common';
import type { ScriptBulkEditPreviewItem } from '@/hooks/useScriptBulkEdit';
import { useScriptReadingSpeed } from '@/hooks/useScriptReadingSpeed';
import { estimateScriptsDurationSeconds, formatScriptDuration } from '@/utils/scriptDuration';
import { getSlideTitle } from '@/utils/slideTitle';

interface ScriptBulkEditModalProps {
  isOpen: boolean;
  isSaving: boolean;
  isPreparingModal: boolean;
  selectedFileName?: string;
  previewItems: ScriptBulkEditPreviewItem[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSave: () => void;
  onOpenFilePicker: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onScriptChange: (index: number, value: string) => void;
}

function ScriptBulkEditModal({
  isOpen,
  isSaving,
  isPreparingModal,
  selectedFileName,
  previewItems,
  fileInputRef,
  onClose,
  onSave,
  onOpenFilePicker,
  onFileChange,
  onScriptChange,
}: ScriptBulkEditModalProps) {
  const { selectedSpeed } = useScriptReadingSpeed();
  const totalDuration = useMemo(() => {
    const durationSeconds = estimateScriptsDurationSeconds(
      previewItems.map((item) => item.script),
      selectedSpeed,
    );
    return formatScriptDuration(durationSeconds);
  }, [previewItems, selectedSpeed]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="대본 일괄 수정"
      size="3xl"
      closeOnBackdropClick={!isSaving && !isPreparingModal}
      closeOnEscape={!isSaving && !isPreparingModal}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-body-m text-gray-800">
            모든 슬라이드 대본을 한 번에 수정할 수 있습니다.
          </p>
          <p className="text-sm text-gray-600">
            줄바꿈 2번(빈 줄 1개 이상)은 슬라이드 구분, 줄바꿈 1번은 슬라이드 내부 줄바꿈입니다.
          </p>
          {selectedFileName ? (
            <p className="text-sm text-gray-600">
              최근 가져온 파일:{' '}
              <span className="font-semibold text-gray-800">{selectedFileName}</span>
            </p>
          ) : null}
          <p className="text-sm text-gray-600">
            전체 예상 읽기 시간:{' '}
            <span className="font-semibold text-gray-800">{totalDuration}</span>{' '}
            <span>(분당 {selectedSpeed}자 기준)</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFilePicker}
          disabled={isSaving || isPreparingModal}
          aria-label="파일에서 대본 가져오기"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadIcon className="h-4 w-4" aria-hidden="true" />
          파일에서 가져오기
        </button>
      </div>

      <div className="max-h-[58vh] w-full space-y-2 overflow-y-auto">
        {isPreparingModal ? (
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-6 text-center text-sm text-gray-600">
            대본을 불러오는 중입니다...
          </div>
        ) : previewItems.length < 1 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-6 text-center text-sm text-gray-600">
            수정할 대본이 없습니다.
          </div>
        ) : (
          <div className="mx-auto w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {previewItems.map(({ slide, index, script }) => (
              <div key={slide.slideId} className="w-full px-2 py-2 sm:px-3 sm:py-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-[224px_minmax(0,1fr)] md:items-stretch md:gap-3">
                  <div className="aspect-video w-full max-w-[224px] overflow-hidden rounded-md border border-gray-200 bg-gray-100 md:max-w-none">
                    {slide.imageUrl ? (
                      <SlideImage
                        src={slide.imageUrl}
                        alt={getSlideTitle(slide.title, slide.slideNum ?? index + 1)}
                        loading="lazy"
                        fetchPriority="low"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-600 sm:text-sm">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-1 md:h-31.5">
                    <div className="flex min-w-0 items-center gap-2 text-xs leading-5 text-gray-700 sm:text-sm">
                      <span className="truncate font-semibold text-gray-800">
                        {getSlideTitle(slide.title, slide.slideNum ?? index + 1)}
                      </span>
                    </div>
                    <textarea
                      value={script}
                      onChange={(event) => onScriptChange(index, event.target.value)}
                      rows={3}
                      className="h-30 w-full resize-none rounded-md border border-gray-200 bg-white p-2 text-xs leading-5 text-gray-800 outline-none focus-visible:border-main sm:p-3 sm:text-sm sm:leading-6 md:h-auto md:min-h-0 md:flex-1"
                      aria-label={`${getSlideTitle(slide.title, slide.slideNum ?? index + 1)} 대본`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-7 flex gap-3">
        <button
          className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
          type="button"
          onClick={onClose}
          disabled={isSaving || isPreparingModal}
        >
          취소
        </button>
        <button
          className="flex-1 rounded-md bg-main py-3 font-bold text-white transition-colors hover:bg-main-variant2 disabled:opacity-50"
          type="button"
          onClick={onSave}
          disabled={isSaving || isPreparingModal || previewItems.length < 1}
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </Modal>
  );
}

export default ScriptBulkEditModal;
