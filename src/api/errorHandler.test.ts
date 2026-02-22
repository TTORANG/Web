import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

import { handleApiError } from './errorHandler';

// Mock showToast
vi.mock('@/utils/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('shows network error toast when status is undefined', () => {
    handleApiError(undefined, '');
    expect(showToast.error).toHaveBeenCalledWith(
      '네트워크 연결을 확인해주세요.',
      '인터넷 상태를 확인한 뒤 다시 시도해주세요.',
    );
  });

  describe('401 handling', () => {
    it('does not logout and falls back to generic toast when logged in', () => {
      // Set logged in state
      useAuthStore
        .getState()
        .login({ id: '1', email: 'user@google.com', sessionId: 's1' }, 'some-token');

      handleApiError(401, '');

      expect(useAuthStore.getState().accessToken).toBe('some-token');
      expect(showToast.error).toHaveBeenCalledWith('요청을 처리하지 못했습니다.', '');
    });

    it('falls back to generic toast when not logged in', () => {
      handleApiError(401, '');
      expect(showToast.error).toHaveBeenCalledWith('요청을 처리하지 못했습니다.', '');
    });
  });

  it('shows permission error for 403', () => {
    handleApiError(403, '특정 권한이 필요합니다');
    expect(showToast.error).toHaveBeenCalledWith('권한이 없습니다.', '특정 권한이 필요합니다');
  });

  it('shows not found error for 404', () => {
    handleApiError(404, '리소스를 찾을 수 없습니다');
    expect(showToast.error).toHaveBeenCalledWith(
      '요청한 정보를 찾을 수 없습니다.',
      '리소스를 찾을 수 없습니다',
    );
  });

  it('shows server error for 500+', () => {
    handleApiError(500, '');
    expect(showToast.error).toHaveBeenCalledWith(
      '서버 오류가 발생했습니다.',
      '잠시 후 다시 시도해주세요.',
    );

    vi.clearAllMocks();
    handleApiError(503, '');
    expect(showToast.error).toHaveBeenCalledWith(
      '서버 오류가 발생했습니다.',
      '잠시 후 다시 시도해주세요.',
    );
  });

  it('shows generic error for 400', () => {
    handleApiError(400, '잘못된 요청입니다');
    expect(showToast.error).toHaveBeenCalledWith(
      '요청을 처리하지 못했습니다.',
      '잘못된 요청입니다',
    );
  });
});
