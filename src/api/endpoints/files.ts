import type { AxiosProgressEvent } from 'axios';

import type { ApiResponse } from '@/types';

import { apiClient } from '../client';
import type { UploadFileRequestDto, UploadFileResponseDto } from '../dto/files.dto';

type UploadOptions = {
  onUploadProgress?: (event: AxiosProgressEvent) => void;
};

export const filesApi = {
  // POST /files/upload - 파일 업로드(발표자료/발표영상)
  uploadFile: async (data: UploadFileRequestDto, options?: UploadOptions) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);

    const response = await apiClient.post<ApiResponse<UploadFileResponseDto>>(
      '/files/upload',
      formData,
      {
        onUploadProgress: options?.onUploadProgress,
      },
    );

    return response.data;
  },
};
