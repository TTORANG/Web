import { useState } from 'react';

import axios from 'axios';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export function useUpload() {
  const [progress, setProgress] = useState(0); // 0~100
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  // ✅TODO
  const UPLOAD_ENDPOINT = '/projects/upload';
  const FORM_KEY = 'files'; // 서버가 file인지 files인지

  const uploadFiles = async (files: File[]) => {
    setError(null);
    setState('uploading');
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append(FORM_KEY, f));

      await axios.post(UPLOAD_ENDPOINT, formData, {
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

      // 네트워크/서버 에러일 때만 response 접근
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.message ?? e.message);
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
