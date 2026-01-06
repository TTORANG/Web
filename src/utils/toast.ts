import { toast } from 'sonner';

/**
 * 전역 알림(Toast) 유틸리티
 *
 * @example
 * showToast.success('업로드 완료!');
 * showToast.error('서버 에러가 발생했습니다.');
 */
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },

  /**
   * 비동기 작업(Promise)의 상태에 따라 토스트를 자동으로 업데이트합니다.
   */
  promise: <T>(
    promise: Promise<T>,
    { loading, success, error }: { loading: string; success: string; error: string },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
