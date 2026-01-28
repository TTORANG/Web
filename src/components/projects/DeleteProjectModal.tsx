import { Modal } from '../common';

type Props = {
  isOpen: boolean;
  projectTitle: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteProjectModal({
  isOpen,
  projectTitle,
  isPending = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="발표 삭제"
      size="sm"
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
    >
      <div className="flex flex-col gap-1">
        <p className="text-body-m-bold">{projectTitle}</p>
        <p className="text-body-m">발표를 정말 삭제하시겠습니까?</p>
      </div>
      <div className="mt-7 flex items-center justify-center gap-3 text-body-s">
        <button
          className="flex-1 rounded-lg py-3 bg-gray-200 text-main cursor-pointer"
          type="button"
          onClick={onClose}
          disabled={isPending}
        >
          취소
        </button>
        <button
          className="border border-none rounded-lg flex-1 py-3 bg-main text-gray-100 cursor-pointer "
          type="button"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </Modal>
  );
}
