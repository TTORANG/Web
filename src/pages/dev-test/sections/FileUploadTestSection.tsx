import { useEffect, useState } from 'react';

import { FileDropzone } from '@/components/common';
import type { UploadStep } from '@/types/uploadFile';
import { showToast } from '@/utils/toast';

export function FileUploadTestSection() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<UploadStep>('preparing');

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
      <h2 className="mb-4 text-lg font-bold text-black">📂 File Upload</h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            setUploadState('preparing');
            setUploadProgress(0);
          }}
          className="rounded bg-gray-200 px-3 py-1 text-xs hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={() => {
            setUploadState('uploading');
            setUploadProgress(0);
          }}
          className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
        >
          Start Upload
        </button>
      </div>

      <FileDropzone
        onFileSelected={(file) => showToast.success(`${file.name} 선택됨`)}
        currentStep={uploadState}
        progress={uploadProgress}
      />
    </section>
  );
}
