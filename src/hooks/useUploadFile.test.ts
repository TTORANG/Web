import { act, renderHook, waitFor } from '@testing-library/react';
import type { AxiosProgressEvent } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { filesApi } from '@/api/endpoints/files';
import { sessionApi } from '@/api/endpoints/session';
import { useAuthStore } from '@/stores/authStore';

import { useUploadFile } from './useUploadFile';

vi.mock('@/api/endpoints/files', () => ({
  filesApi: {
    createUploadUrl: vi.fn(),
    uploadToSignedUrl: vi.fn(),
    completeUpload: vi.fn(),
  },
}));

vi.mock('@/api/endpoints/session', () => ({
  sessionApi: {
    createAnonymousSession: vi.fn(),
  },
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

const mockFilesApi = vi.mocked(filesApi);
const mockSessionApi = vi.mocked(sessionApi);
const mockGetAuthState = vi.mocked(useAuthStore.getState);

describe('useUploadFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthState.mockReturnValue({
      accessToken: 'token',
      user: { id: '1' },
    } as never);
  });

  it('uploads through signed URL flow and completes with done state', async () => {
    const file = new File(['pdf-content'], 'deck.pdf', { type: 'application/pdf' });

    mockFilesApi.createUploadUrl.mockResolvedValue({
      resultType: 'SUCCESS',
      error: null,
      success: {
        objectKey: 'dev/upload/temp/deck.pdf',
        uploadUrl: 'https://storage.googleapis.com/mock-signed-url',
        expiresAt: '2026-02-18T00:00:00.000Z',
        uploadToken: 'upload-token',
      },
    });

    mockFilesApi.uploadToSignedUrl.mockImplementation(async (_args, options) => {
      options?.onUploadProgress?.({
        loaded: 100,
        total: 100,
      } as AxiosProgressEvent);
    });

    mockFilesApi.completeUpload.mockResolvedValue({
      resultType: 'SUCCESS',
      error: null,
      success: { projectId: '123' },
    });

    const { result } = renderHook(() => useUploadFile());

    let response: unknown;
    await act(async () => {
      response = await result.current.uploadFile({ file, title: file.name });
    });

    expect(response).toEqual({
      resultType: 'SUCCESS',
      error: null,
      success: { projectId: '123' },
    });
    expect(mockFilesApi.createUploadUrl).toHaveBeenCalledWith(
      {
        purpose: 'presentation_file',
        contentType: 'application/pdf',
        size: file.size,
        originalFilename: 'deck.pdf',
        title: 'deck',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(mockFilesApi.uploadToSignedUrl).toHaveBeenCalledTimes(1);
    expect(mockFilesApi.completeUpload).toHaveBeenCalledWith(
      {
        objectKey: 'dev/upload/temp/deck.pdf',
        uploadToken: 'upload-token',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(mockSessionApi.createAnonymousSession).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.progress).toEqual({ percentage: 100, currentStep: 'done' });
    });
  });

  it('returns null and sets error when upload-url request fails', async () => {
    const file = new File(['pdf-content'], 'deck.pdf', { type: 'application/pdf' });

    mockFilesApi.createUploadUrl.mockResolvedValue({
      resultType: 'FAILURE',
      error: {
        errorCode: 'F001',
        reason: '업로드 URL 발급 실패',
      },
      success: null,
    });

    const { result } = renderHook(() => useUploadFile());

    let response: unknown;
    await act(async () => {
      response = await result.current.uploadFile({ file, title: file.name });
    });

    expect(response).toBeNull();
    expect(mockFilesApi.uploadToSignedUrl).not.toHaveBeenCalled();
    expect(mockFilesApi.completeUpload).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.error).toBe('업로드 URL 발급 실패');
      expect(result.current.progress).toEqual({ percentage: 0, currentStep: 'preparing' });
    });
  });

  it('returns null and resets state on cancel', async () => {
    const file = new File(['pdf-content'], 'deck.pdf', { type: 'application/pdf' });

    mockFilesApi.createUploadUrl.mockResolvedValue({
      resultType: 'SUCCESS',
      error: null,
      success: {
        objectKey: 'dev/upload/temp/deck.pdf',
        uploadUrl: 'https://storage.googleapis.com/mock-signed-url',
        expiresAt: '2026-02-18T00:00:00.000Z',
        uploadToken: 'upload-token',
      },
    });

    mockFilesApi.uploadToSignedUrl.mockImplementation(
      (_args, options) =>
        new Promise<void>((_resolve, reject) => {
          const signal = options?.signal;
          if (signal?.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }

          signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        }),
    );

    const { result } = renderHook(() => useUploadFile());

    let uploadPromise: Promise<unknown>;
    await act(async () => {
      uploadPromise = result.current.uploadFile({ file, title: file.name });
    });

    act(() => {
      result.current.cancelUpload();
    });

    let response: unknown;
    await act(async () => {
      response = await uploadPromise!;
    });

    expect(response).toBeNull();
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toEqual({ percentage: 0, currentStep: 'preparing' });
    expect(result.current.error).toBeNull();
  });
});
