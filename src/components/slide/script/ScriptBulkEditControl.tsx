import clsx from 'clsx';

import UploadIcon from '@/assets/icons/icon-upload.svg?react';
import { useScriptBulkEdit } from '@/hooks/useScriptBulkEdit';

import ScriptBulkEditModal from './ScriptBulkEditModal';

export default function ScriptBulkEditControl() {
  const {
    projectId,
    fileInputRef,
    isModalOpen,
    isSaving,
    isPreparingModal,
    selectedFileName,
    previewItems,
    handleOpenModal,
    handleCloseModal,
    handleOpenFilePicker,
    handleFileChange,
    handlePreviewScriptChange,
    handleSaveBulkEdit,
  } = useScriptBulkEdit();

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={isSaving || !projectId}
        aria-label="대본 일괄 수정"
        className={clsx(
          'inline-flex h-7 shrink-0 items-center gap-1 rounded px-1.5 sm:pl-2 sm:pr-1.5',
          'outline-1 -outline-offset-1 focus-visible:outline-2 focus-visible:outline-main',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'bg-white text-gray-800 outline-gray-200 hover:bg-gray-100 active:bg-gray-200',
        )}
      >
        <span className="hidden text-sm font-semibold leading-5 sm:inline">대본 일괄 수정</span>
        <UploadIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      <ScriptBulkEditModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        isPreparingModal={isPreparingModal}
        selectedFileName={selectedFileName}
        previewItems={previewItems}
        fileInputRef={fileInputRef}
        onClose={handleCloseModal}
        onSave={handleSaveBulkEdit}
        onOpenFilePicker={handleOpenFilePicker}
        onFileChange={handleFileChange}
        onScriptChange={handlePreviewScriptChange}
      />
    </>
  );
}
