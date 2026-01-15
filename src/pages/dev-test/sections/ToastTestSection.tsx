import { showToast } from '@/utils/toast';

export function ToastTestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">🎨 Toast 테스트</h2>

      {/* 기본 토스트 */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600">기본 (메시지만)</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => showToast.info('복사가 완료되었습니다.')}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            Info
          </button>
          <button
            onClick={() => showToast.success('저장되었습니다.')}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          >
            Success
          </button>
          <button
            onClick={() => showToast.warning('주의가 필요합니다.')}
            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
          >
            Warning
          </button>
          <button
            onClick={() => showToast.error('오류가 발생했습니다.')}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Error
          </button>
        </div>
      </div>

      {/* Description 포함 토스트 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-600">설명 포함</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => showToast.info('알림', '새로운 메시지가 도착했습니다.')}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            Info + 설명
          </button>
          <button
            onClick={() => showToast.success('업로드 완료', '파일이 성공적으로 업로드되었습니다.')}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          >
            Success + 설명
          </button>
          <button
            onClick={() => showToast.warning('용량 부족', '저장 공간이 10% 미만입니다.')}
            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
          >
            Warning + 설명
          </button>
          <button
            onClick={() => showToast.error('업로드 실패', '파일 크기가 100MB를 초과합니다.')}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Error + 설명
          </button>
        </div>
      </div>
    </section>
  );
}
