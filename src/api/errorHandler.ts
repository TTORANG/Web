import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

type ErrorHandler = (message: string) => void;

/**
 * HTTP 상태 코드별 에러 처리 전략
 */
const errorHandlers: Record<number, ErrorHandler> = {
  401: () => {
    // 세션 만료 시 로그아웃 처리
    useAuthStore.getState().logout();
    showToast.error('로그인이 만료되었습니다.', '다시 로그인해주세요.');
  },
  403: () => {
    showToast.error('권한이 없습니다.', '이 작업에 대한 접근 권한이 부족합니다.');
  },
  404: () => {
    showToast.error('요청하신 데이터를 찾을 수 없습니다.');
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
    showToast.error('네트워크 오류', '인터넷 연결을 확인해주세요.');
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

  // 3. 그 외 일반 에러 (400 등)는 서버 메시지 그대로 출력
  showToast.error(message);
};
