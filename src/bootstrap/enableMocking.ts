/**
 * MSW 활성화 (개발 환경 전용)
 *
 * VITE_API_MOCKING=true 환경변수가 설정된 경우에만 MSW를 시작합니다.
 * npm run dev:local 시 자동으로 활성화됩니다.
 */
export async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKING !== 'true') {
    return;
  }

  const { worker } = await import('@/mocks/browser');

  return worker.start({
    onUnhandledRequest: 'bypass', // 모킹되지 않은 요청은 그대로 통과
  });
}
