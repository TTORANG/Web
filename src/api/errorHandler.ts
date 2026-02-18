import { showToast } from '@/utils/toast';

type ErrorHandler = (message: string) => void;

/**
 * HTTP 상태 코드별 에러 처리 전략
 *
 * 401은 client.ts 인터셉터에서 토큰 재발급 → 실패 시 logout까지 전담 처리.
 * 여기서 중복 처리하면 재발급 진행 중에 토큰이 사라지는 치명적 버그가 발생하므로 제거.
 */
const errorHandlers: Record<number, ErrorHandler> = {
  403: (message: string) => {
    showToast.error('권한이 없습니다.', message || '접근 권한을 확인해주세요.');
  },
  404: (message: string) => {
    showToast.error('요청한 정보를 찾을 수 없습니다.', message);
  },
  409: (_: string) => {
    // 영상 처리 중(slides 조회 409)에는 안내 토스트를 띄우지 않습니다.
  },
};

/**
 * 500번대 서버 에러 처리
 */
const handleServerSideError = () => {
  showToast.error('서버 오류가 발생했습니다.', '잠시 후 다시 시도해주세요.');
};

/**
 * API 에러 통합 핸들러
 *
 * @param status - HTTP 상태 코드
 * @param message - 서버에서 내려온 에러 메시지
 */
export const handleApiError = (status: number | undefined, message: string) => {
  if (!status) {
    showToast.error('네트워크 연결을 확인해주세요.', '인터넷 상태를 확인한 뒤 다시 시도해주세요.');
    return;
  }

  // 1. 매핑된 핸들러가 있으면 실행 (401, 403, 404 등)
  const handler = errorHandlers[status];
  if (handler) {
    handler(message);
    return;
  }

  // 2. 500번대 에러 처리
  if (status >= 500) {
    handleServerSideError();
    return;
  }

  // 3. 그 외 일반 에러 (400 등)는 제목을 통일하고 메시지는 설명으로 전달
  showToast.error('요청을 처리하지 못했습니다.', message);
};
