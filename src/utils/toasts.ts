import { toast } from 'sonner';

/**
 * 전역 알림(Toast) 유틸리티
 *
 * @example
 * import { showToast } from '@/utils/toast';
 * const onUpload = async (file: File) => {
 *   await showToast.promise(uploadApi(file), {
 *     loading: '파일을 서버로 전송하고 변환 중입니다...',
 *     success: '발표 준비가 완료되었습니다!',
 *     error: 'PDF 파일 변환에 실패했습니다.',
 *   });
 * };
 */
export const showToast = {
  // 성공 알림
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  // 오류 알림
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  // 정보 알림
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  // 로딩/비동기 처리 알림
  // 비동기 작업(Promise)을 받아서 처리 상태에 따라 알림 표시
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};
