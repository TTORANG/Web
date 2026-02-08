import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';

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

export function ErrorTestSection() {
  const trigger400 = useTrigger400();

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <TestQueryError />
      <h2 className="mb-4 text-lg font-bold text-black">🚨 에러 핸들링 테스트</h2>

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

      <p className="text-xs text-gray-600">
        * 400: 페이지 진입 시 자동 + 버튼 클릭 (React Query) | 401, 500: Axios 인터셉터
      </p>
    </section>
  );
}
