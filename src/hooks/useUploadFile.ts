/**
 * 파일 업로드 훅
 *
 * 진행률 추적과 에러 처리를 포함한 파일 업로드 기능을 제공합니다.
 *
 * @returns progress - 업로드 진행률 (0-100)
 * @returns isUploading - 업로드 상태 ('preparing' | 'uploading' | 'finishing' | 'done')
 * @returns error - 에러 메시지
 * @returns uploadFiles - 파일 업로드 함수
 * @returns reset - 상태 초기화 함수
 */
import { useCallback, useState } from 'react';

import type { AxiosProgressEvent } from 'axios';

import type { UploadFileRequestDto, UploadFileResponseDto } from '@/api/dto/files.dto';
import { filesApi } from '@/api/endpoints/files';
import { sessionApi } from '@/api/endpoints/session';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types';

interface UploadProgress {
  percentage: number;
  currentStep: 'preparing' | 'uploading' | 'finishing' | 'done';
}

const initialProgress: UploadProgress = {
  percentage: 0,
  currentStep: 'preparing',
};

export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>(initialProgress);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (data: UploadFileRequestDto): Promise<ApiResponse<UploadFileResponseDto> | null> => {
      // 업로드 시작 상태
      setIsUploading(true);
      setError(null);
      setProgress({ ...initialProgress, currentStep: 'preparing' });

      try {
        /**
         * 익명 세션 발급
         * - store에 accessToken이 있으면 session 생성을 스킵함
         */
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
          const sessionResponse = await sessionApi.createAnonymousSession();
          if (sessionResponse.resultType === 'FAILURE') {
            throw new Error(sessionResponse.error?.reason ?? '익명 세션 생성 실패');
          }
        }

        // 업로드 시작
        setProgress({ ...initialProgress, currentStep: 'uploading' });

        // 업로드 요청
        const startResponse = await filesApi.uploadFile(data, {
          onUploadProgress: (e: AxiosProgressEvent) => {
            const total = e.total ?? 0;
            if (!total) return;

            const percentage = Math.round((e.loaded * 100) / total);

            // 전송이 거의 끝났을 때
            setProgress({
              percentage,
              currentStep: percentage >= 100 ? 'finishing' : 'uploading',
            });
          },
        });

        // 응답 검증
        if (startResponse.resultType === 'FAILURE') {
          throw new Error(startResponse.error?.reason ?? '파일 업로드에 실패했어요.');
        }

        const projectId = startResponse.success?.projectId;
        if (!projectId) {
          throw new Error('projectId를 받아오지 못했어요.(업로드는 성공)');
        }

        // 완료 처리
        setProgress({ percentage: 100, currentStep: 'done' });

        return startResponse;
      } catch (err: unknown) {
        let errorMessage = '업로드 중 오류가 발생했습니다.';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        const axiosError = err as {
          response?: {
            data?: {
              error?: {
                reason?: string;
                errorCode?: string;
              };
            };
          };
        };

        if (axiosError?.response?.data?.error) {
          const apiError = axiosError.response.data.error;
          errorMessage = apiError.reason || errorMessage;
        }
        setError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { uploadFiles, isUploading, progress, error };
}
