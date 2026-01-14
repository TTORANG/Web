import { useState } from 'react';

import { Modal } from '@/components/common';

export function ModalTestSection() {
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-800">🪟 Modal 테스트</h2>

      <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-gray-800">Features</p>
        <ul className="list-inside list-disc space-y-1">
          <li>size: sm | md | lg</li>
          <li>title: 선택적 제목</li>
          <li>showCloseButton: 닫기 버튼 표시 여부</li>
          <li>closeOnBackdropClick: 배경 클릭으로 닫기</li>
          <li>closeOnEscape: ESC 키로 닫기</li>
          <li>포커스 트랩 및 body 스크롤 방지</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsBasicModalOpen(true)}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
        >
          기본 모달
        </button>
        <button
          onClick={() => setIsTitleModalOpen(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
        >
          제목 있는 모달
        </button>
        <button
          onClick={() => setIsLargeModalOpen(true)}
          className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600"
        >
          큰 모달 (lg)
        </button>
      </div>

      {/* 기본 모달 */}
      <Modal isOpen={isBasicModalOpen} onClose={() => setIsBasicModalOpen(false)} size="sm">
        <div className="text-center">
          <p className="text-gray-800">기본 모달입니다.</p>
          <p className="mt-2 text-sm text-gray-500">ESC 키나 배경 클릭으로 닫을 수 있습니다.</p>
        </div>
      </Modal>

      {/* 제목 있는 모달 */}
      <Modal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        title="발표 자료 공유"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <p className="text-sm font-medium text-gray-600">공유 링크</p>
            <p className="mt-1 text-sm text-gray-800">https://ttorang.app/share/abc123</p>
          </div>
          <button
            onClick={() => setIsTitleModalOpen(false)}
            className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </Modal>

      {/* 큰 모달 */}
      <Modal
        isOpen={isLargeModalOpen}
        onClose={() => setIsLargeModalOpen(false)}
        title="큰 모달"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            큰 사이즈의 모달입니다. 더 많은 콘텐츠를 표시할 수 있습니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm font-medium">항목 1</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm font-medium">항목 2</p>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}
