import { Link } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api';
import { Skeleton, Spinner } from '@/components/common';
import { showToast } from '@/utils/toast';

/**
 * React Query 전역 에러 테스트용 컴포넌트
 * 마운트 시 자동으로 400 에러 발생
 */
function TestQueryError() {
  useQuery({
    queryKey: ['test-error-400'],
    queryFn: () => apiClient.get('/test/error/400'),
    retry: 0,
  });
  return null;
}

/** 400 에러 버튼 클릭용 hook */
function useTrigger400() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['test-error-400'] });
  };
}

export default function DevTestPage() {
  const trigger400 = useTrigger400();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      <TestQueryError />
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🛠️ 개발 테스트 페이지</h1>
        <Link to="/" className="text-body-s text-main hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>

      {/* Toast 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🎨 Toast 테스트</h2>

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
              onClick={() =>
                showToast.success('업로드 완료', '파일이 성공적으로 업로드되었습니다.')
              }
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

      {/* 에러 핸들링 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🚨 에러 핸들링 테스트</h2>

        <div className="mb-4">
          <h3 className="mb-3 text-sm font-medium text-gray-600">에러 테스트</h3>
          <p className="mb-3 text-xs text-orange-600">⚠️ 400 에러는 페이지 진입 시 자동 발생</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={trigger400}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              400 (React Query)
            </button>
            <button
              onClick={() => apiClient.get('/test/error/401')}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              401 (Axios)
            </button>
            <button
              onClick={() => apiClient.get('/test/error/500')}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              500 (Axios)
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          * 400: 페이지 진입 시 자동 + 버튼 클릭 (React Query) | 401, 500: Axios 인터셉터
        </p>
      </section>

      {/* Skeleton 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">💀 Skeleton 테스트</h2>

        {/* 기본 스켈레톤 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-600">기본 스켈레톤</h3>
          <div className="flex flex-col gap-2">
            <Skeleton width="100%" height={20} />
            <Skeleton width="80%" height={20} />
            <Skeleton width="60%" height={20} />
          </div>
        </div>

        {/* 원형 스켈레톤 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-600">원형 (Circle)</h3>
          <div className="flex gap-3">
            <Skeleton.Circle size={32} />
            <Skeleton.Circle size={48} />
            <Skeleton.Circle size={64} />
          </div>
        </div>

        {/* 텍스트 스켈레톤 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-600">텍스트 (Text)</h3>
          <Skeleton.Text lines={3} />
        </div>

        {/* 프리셋 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-600">프리셋</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs text-gray-500">Card</p>
              <Skeleton.Card />
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500">ListItem</p>
              <Skeleton.ListItem />
              <Skeleton.ListItem />
            </div>
          </div>
        </div>
      </section>

      {/* Spinner 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🔄 Spinner 테스트</h2>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner size={16} />
            <span className="text-xs text-gray-500">16px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} />
            <span className="text-xs text-gray-500">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={32} />
            <span className="text-xs text-gray-500">32px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} color="var(--color-main)" />
            <span className="text-xs text-gray-500">main</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} color="var(--color-error)" />
            <span className="text-xs text-gray-500">error</span>
          </div>
        </div>
      </section>

      {/* 컴포넌트 테스트 영역 (확장용) */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-600">📦 컴포넌트 테스트 영역</h2>
        <p className="text-sm text-gray-500">새로운 컴포넌트를 테스트할 때 이 영역에 추가하세요.</p>
      </section>
    </main>
  );
}
