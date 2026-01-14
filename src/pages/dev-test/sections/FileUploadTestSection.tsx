import { useEffect, useState } from 'react';

import { FileDropzone } from '@/components/common';
import { showToast } from '@/utils/toast';

export function FileUploadTestSection() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  // Simulate Upload Progress
  useEffect(() => {
    if (uploadState === 'uploading') {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            setUploadState('done');
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [uploadState]);

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-800">📂 File Upload</h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            setUploadState('idle');
            setUploadProgress(0);
          }}
          className="rounded px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={() => {
            setUploadState('uploading');
            setUploadProgress(0);
          }}
          className="rounded px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          Start Upload
        </button>
      </div>

      <FileDropzone
        onFilesSelected={(files) => showToast.success(`${files.length}개 파일 선택됨`)}
        uploadState={uploadState}
        progress={uploadProgress}
      />
    </section>
  );
}
