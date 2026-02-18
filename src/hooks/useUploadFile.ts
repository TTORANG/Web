import { useCallback, useRef, useState } from 'react';

import type { AxiosProgressEvent } from 'axios';
import axios from 'axios';

import type { ApiFailureResponse } from '@/api/client';
import type { UploadFileRequestDto, UploadFileResponseDto } from '@/api/dto/files.dto';
import { filesApi } from '@/api/endpoints/files';
import { sessionApi } from '@/api/endpoints/session';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types';
import type { UploadStep } from '@/types/uploadFile';

interface UploadProgress {
  percentage: number;
  currentStep: UploadStep;
}

const initialProgress: UploadProgress = {
  percentage: 0,
  currentStep: 'preparing',
};

/**
 * 파일 업로드 훅
 *
 * 진행률 추적과 에러 처리를 포함한 파일 업로드 기능을 제공합니다.
 *
 * @returns uploadFile - 파일 업로드 함수
 * @returns cancelUpload - 업로드 취소 함수
 * @returns resetUpload - 상태 초기화 함수
 * @returns isUploading - 업로드 진행 중 여부
 * @returns progress - 업로드 진행 상태 (퍼센트, 단계)
 * @returns error - 에러 메시지
 */
export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>(initialProgress);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setError(null);
    setProgress(initialProgress);
    setIsUploading(false);
  }, []);

  // 업로드 시작
  const uploadFile = useCallback(
    async (data: UploadFileRequestDto): Promise<ApiResponse<UploadFileResponseDto> | null> => {
      // 기존 업로드가 남아있으면 정리
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      // 업로드 시작 상태
      setIsUploading(true);
      setError(null);
      setProgress({ ...initialProgress, currentStep: 'preparing' });

      try {
        /**
         * 익명 세션 발급
         * - accessToken이 없거나
         * - user가 없으면 익명 세션을 다시 확보
         */
        const state = useAuthStore.getState();
        const needsAnonymousSession = !state.accessToken || !state.user;

        if (needsAnonymousSession) {
          const sessionResponse = await sessionApi.createAnonymousSession();
          if (sessionResponse.resultType === 'FAILURE') {
            throw new Error(sessionResponse.error?.reason ?? '익명 세션 생성 실패');
          }
        }

        // 업로드 시작
        setProgress({ ...initialProgress, currentStep: 'uploading' });

        const uploadUrlResponse = await filesApi.createUploadUrl(
          {
            purpose: 'presentation_file',
            contentType: data.file.type,
            size: data.file.size,
            originalFilename: data.file.name,
            title: data.title,
          },
          { signal: controller.signal },
        );

        if (uploadUrlResponse.resultType === 'FAILURE') {
          throw new Error(uploadUrlResponse.error?.reason ?? '업로드 URL 발급에 실패했어요.');
        }

        await filesApi.uploadToSignedUrl(
          {
            uploadUrl: uploadUrlResponse.success.uploadUrl,
            file: data.file,
            contentType: data.file.type,
          },
          {
            signal: controller.signal,
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
          },
        );

        setProgress({ percentage: 100, currentStep: 'finishing' });

        const completeResponse = await filesApi.completeUpload(
          {
            objectKey: uploadUrlResponse.success.objectKey,
            uploadToken: uploadUrlResponse.success.uploadToken,
          },
          { signal: controller.signal },
        );

        if (completeResponse.resultType === 'FAILURE') {
          throw new Error(completeResponse.error?.reason ?? '파일 업로드 완료 처리에 실패했어요.');
        }

        // 완료 처리
        setProgress({ percentage: 100, currentStep: 'done' });
        return {
          resultType: 'SUCCESS',
          error: null,
          success: {
            projectId: completeResponse.success.projectId,
          },
        };
      } catch (err: unknown) {
        if (
          (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') ||
          (err instanceof DOMException && err.name === 'AbortError')
        ) {
          return null;
        }

        // 에러
        let errorMessage = '업로드 중 오류가 발생했습니다.';

        if (axios.isAxiosError<ApiFailureResponse>(err)) {
          errorMessage = err.response?.data?.error?.reason || err.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setProgress({ ...initialProgress, currentStep: 'preparing' });
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  /** 상태 초기화 */
  const resetUpload = useCallback(() => {
    setError(null);
    setProgress(initialProgress);
    setIsUploading(false);
  }, []);

  return { uploadFile, cancelUpload, resetUpload, isUploading, progress, error };
}
