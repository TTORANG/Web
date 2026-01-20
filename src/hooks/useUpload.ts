/**
 * 파일 업로드 훅
 *
 * 진행률 추적과 에러 처리를 포함한 파일 업로드 기능을 제공합니다.
 *
 * @returns progress - 업로드 진행률 (0-100)
 * @returns state - 업로드 상태 ('idle' | 'uploading' | 'done' | 'error')
 * @returns error - 에러 메시지
 * @returns uploadFiles - 파일 업로드 함수
 * @returns reset - 상태 초기화 함수
 */
import { useState } from 'react';

import type { AxiosError } from 'axios';

import { type ApiError, apiClient } from '@/api/client';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

const UPLOAD_ENDPOINT = '/projects/upload';
const FORM_KEY = 'files';

export function useUpload() {
  const [progress, setProgress] = useState(0); // 0~100
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]) => {
    setError(null);
    setState('uploading');
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append(FORM_KEY, f));

      await apiClient.post(UPLOAD_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const total = evt.total ?? 0;
          if (!total) return;
          setProgress(Math.round((evt.loaded * 100) / total));
        },
      });
      setState('done');
      setProgress(100);
    } catch (e: unknown) {
      setState('error');

      if (typeof e === 'object' && e !== null && 'response' in e) {
        const axiosError = e as AxiosError<ApiError>;
        setError(axiosError.response?.data?.message ?? axiosError.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('업로드 실패');
      }
    }
  };

  const reset = () => {
    setState('idle');
    setProgress(0);
    setError(null);
  };

  return { progress, state, error, uploadFiles, reset };
}
