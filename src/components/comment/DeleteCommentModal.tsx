import { Modal } from '@/components/common';

interface DeleteCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCommentModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteCommentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="댓글 삭제" size="sm">
      <p className="text-body-m">댓글을 삭제하시겠습니까?</p>
      <div className="mt-7 flex gap-3">
        <button
          className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
          type="button"
          onClick={onClose}
        >
          취소
        </button>
        <button
          className="flex-1 rounded-md bg-error py-3 font-bold text-white transition-colors hover:bg-error/90"
          type="button"
          onClick={onConfirm}
        >
          삭제
        </button>
      </div>
    </Modal>
  );
}
