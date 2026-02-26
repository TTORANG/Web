import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockAuthState = {
  accessToken: string | null;
  user: { id: string; email: string; sessionId: string } | null;
  refreshToken: string | null;
  isLoginModalOpen: boolean;
  setAuth: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
};

const { mockGetAuthState, mockHandleApiError, mockReissueToken } = vi.hoisted(() => ({
  mockGetAuthState: vi.fn<() => MockAuthState>(),
  mockHandleApiError: vi.fn(),
  mockReissueToken: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: mockGetAuthState,
  },
}));

vi.mock('@/api/errorHandler', () => ({
  handleApiError: mockHandleApiError,
}));

vi.mock('@/api/endpoints/session', () => ({
  sessionApi: {
    reissueToken: mockReissueToken,
  },
}));

function createAuthState(accessToken: string | null = 'access-token'): MockAuthState {
  return {
    accessToken,
    user: { id: 'user-1', email: 'user@google.com', sessionId: 'session-1' },
    refreshToken: 'refresh-token',
    isLoginModalOpen: false,
    setAuth: vi.fn(),
    logout: vi.fn(),
  };
}

function createUnauthorizedError(): AxiosError {
  return {
    config: { headers: {} } as InternalAxiosRequestConfig & { _retry?: boolean },
    response: {
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: { headers: {} } as InternalAxiosRequestConfig,
      data: {
        resultType: 'FAILURE',
        error: {
          reason: 'unauthorized',
          errorCode: '401',
          data: null,
        },
        success: null,
      },
    },
    isAxiosError: true,
    message: 'Request failed with status code 401',
    name: 'AxiosError',
    toJSON: () => ({}),
  } as AxiosError;
}

async function getRejectedInterceptor() {
  const { apiClient } = await import('./client');
  const handlers = (
    apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected?: (error: AxiosError) => Promise<unknown> }>;
    }
  ).handlers;

  const rejected = handlers[handlers.length - 1]?.rejected;
  if (!rejected) {
    throw new Error('Response rejected interceptor not found');
  }

  return { apiClient, rejected };
}

describe('apiClient 401 interceptor', () => {
  let authState: MockAuthState;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    authState = createAuthState();
    mockGetAuthState.mockImplementation(() => authState);
  });

  it('skips reissue and silences 401 when already logged out', async () => {
    authState.accessToken = null;
    const { rejected } = await getRejectedInterceptor();
    const error = createUnauthorizedError();

    await expect(rejected(error)).rejects.toBe(error);

    expect(error.isHandled).toBe(true);
    expect(mockReissueToken).not.toHaveBeenCalled();
    expect(authState.logout).not.toHaveBeenCalled();
    expect(mockHandleApiError).not.toHaveBeenCalled();
  });

  it('does not restore auth when logout happens during reissue', async () => {
    mockReissueToken.mockImplementation(async () => {
      authState.accessToken = null;
      return {
        resultType: 'SUCCESS',
        success: {
          tokens: { accessToken: 'new-access-token' },
        },
      };
    });

    const { rejected } = await getRejectedInterceptor();
    const error = createUnauthorizedError();

    await expect(rejected(error)).rejects.toBe(error);

    expect(error.isHandled).toBe(true);
    expect(authState.setAuth).not.toHaveBeenCalled();
    expect(authState.logout).not.toHaveBeenCalled();
    expect(mockHandleApiError).not.toHaveBeenCalled();
  });

  it('keeps reissue->retry flow for normal 401 recovery', async () => {
    mockReissueToken.mockResolvedValue({
      resultType: 'SUCCESS',
      success: {
        tokens: { accessToken: 'new-access-token' },
      },
    });

    const { apiClient, rejected } = await getRejectedInterceptor();
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: 'OK',
    }));
    apiClient.defaults.adapter = adapter as never;

    const error = createUnauthorizedError();
    await expect(rejected(error)).resolves.toMatchObject({ status: 200 });

    expect(authState.setAuth).toHaveBeenCalledWith({
      user: authState.user,
      accessToken: 'new-access-token',
      refreshToken: authState.refreshToken,
    });
    expect(adapter).toHaveBeenCalled();
  });

  it('still logs out and reports session-expired when reissue fails', async () => {
    mockReissueToken.mockRejectedValue(new Error('reissue failed'));

    const { rejected } = await getRejectedInterceptor();
    const error = createUnauthorizedError();

    await expect(rejected(error)).rejects.toThrow('reissue failed');

    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(mockHandleApiError).toHaveBeenCalledWith(
      401,
      '세션이 만료되었습니다. 다시 로그인해주세요.',
    );
  });
});
