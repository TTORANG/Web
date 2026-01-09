import { useState } from 'react';

import type { AxiosError } from 'axios';

import { type ApiError, apiClient } from '@/api/client';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

// ✅TODO
const UPLOAD_ENDPOINT = '/projects/upload';
const FORM_KEY = 'files'; // 서버가 file인지 files인지

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

  const simulateUpload = () => {
    setError(null);
    setState('uploading');
    setProgress(0);

    let p = 0;
    const timer = setInterval(() => {
      p += 8;
      if (p >= 100) {
        clearInterval(timer);
        setProgress(100);
        setState('done');
        return;
      }
      setProgress(p);
    }, 120);
  };

  return { progress, state, error, uploadFiles, reset, simulateUpload };
}
