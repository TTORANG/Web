import { Modal } from '@/components/common';

interface DeleteVideoModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteVideoModal({ isOpen, title, onClose, onConfirm }: DeleteVideoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영상 삭제" size="sm">
      <p className="mb-6 text-body-m">
        <span className="font-bold">{title}</span> 영상을 삭제하시겠습니까?
        <br />
        <span className="text-sm text-gray-600">삭제된 영상은 복구할 수 없습니다.</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200"
          type="button"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-md bg-error py-3 font-bold text-white transition-colors hover:bg-error/90"
          type="button"
        >
          삭제
        </button>
      </div>
    </Modal>
  );
}
