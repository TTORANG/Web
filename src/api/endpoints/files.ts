import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';

import type { ApiResponse } from '@/types';

import { apiClient } from '../client';
import type {
  CompleteUploadRequestDto,
  CompleteUploadResponseDto,
  CreateUploadUrlRequestDto,
  CreateUploadUrlResponseDto,
} from '../dto/files.dto';

type UploadOptions = {
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  signal?: AbortSignal;
};

export const filesApi = {
  createUploadUrl: async (
    data: CreateUploadUrlRequestDto,
    options?: UploadOptions,
  ): Promise<ApiResponse<CreateUploadUrlResponseDto>> => {
    const response = await apiClient.post<ApiResponse<CreateUploadUrlResponseDto>>(
      '/files/upload-url',
      data,
      {
        signal: options?.signal,
      },
    );
    return response.data;
  },

  uploadToSignedUrl: async (
    args: {
      uploadUrl: string;
      file: File;
      contentType: string;
    },
    options?: UploadOptions,
  ): Promise<void> => {
    await axios.put(args.uploadUrl, args.file, {
      headers: {
        'Content-Type': args.contentType,
      },
      signal: options?.signal,
      onUploadProgress: options?.onUploadProgress,
    });
  },

  completeUpload: async (
    data: CompleteUploadRequestDto,
    options?: UploadOptions,
  ): Promise<ApiResponse<CompleteUploadResponseDto>> => {
    const response = await apiClient.post<ApiResponse<CompleteUploadResponseDto>>(
      '/files/upload-complete',
      data,
      {
        signal: options?.signal,
      },
    );
    return response.data;
  },
};
