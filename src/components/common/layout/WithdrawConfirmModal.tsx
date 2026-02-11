import { Modal } from '@/components/common/Modal';

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WithdrawConfirmModal({
  isOpen,
  isPending = false,
  onClose,
  onConfirm,
}: WithdrawConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="회원 탈퇴"
      size="sm"
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
    >
      <p className="text-body-m">
        탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
        <br />
        정말 탈퇴하시겠습니까?
      </p>
      <div className="mt-7 flex gap-3">
        <button
          className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
          type="button"
          onClick={onClose}
          disabled={isPending}
        >
          취소
        </button>
        <button
          className="flex-1 rounded-md bg-error py-3 font-bold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
          type="button"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? '탈퇴 중...' : '탈퇴'}
        </button>
      </div>
    </Modal>
  );
}
