import { Modal } from '@/components/common';

type RecordStep = 'TEST' | 'RECORDING';

interface RecordExitModalProps {
  isOpen: boolean;
  step: RecordStep;
  onClose: () => void;
  onConfirm: () => void;
}

export function RecordExitModal({ isOpen, step, onClose, onConfirm }: RecordExitModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'RECORDING' ? '녹화 중단' : '테스트 종료'}
      size="sm"
    >
      <div className="text-body-m">
        {step === 'RECORDING' ? (
          <>
            녹화를 중단하시겠습니까?
            <br />
            저장되지 않은 데이터는 삭제됩니다.
          </>
        ) : (
          '테스트를 종료하시겠습니까?'
        )}
      </div>
      <div className="mt-7 flex gap-3">
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
          종료
        </button>
      </div>
    </Modal>
  );
}
