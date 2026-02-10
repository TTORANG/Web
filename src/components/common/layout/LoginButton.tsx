/**
 * @file LoginButton.tsx
 * @description 로그인/프로필 버튼 컴포넌트
 *
 * 비로그인 상태: 로그인 버튼 (클릭 시 로그인 모달)
 * 로그인 상태: 사용자 이름 + 프로필 이미지 (클릭 시 로그아웃/회원탈퇴 드롭다운)
 */
import { useState } from 'react';

import { apiClient } from '@/api/client';
import LoginIcon from '@/assets/icons/icon-login.svg?react';
import LogoutIcon from '@/assets/icons/icon-logout.svg?react';
import { Dropdown } from '@/components/common/Dropdown';
import { Modal } from '@/components/common/Modal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/utils/toast';

import { HeaderButton } from './HeaderButton';

export function LoginButton() {
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const logout = useAuthStore((s) => s.logout);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!user) {
    return <HeaderButton text="로그인" icon={<LoginIcon />} onClick={openLoginModal} />;
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await apiClient.delete(`/users/${user.id}`);
      logout();
      setIsWithdrawModalOpen(false);
      showToast.success('회원 탈퇴가 완료되었습니다.');
    } catch {
      showToast.error('회원 탈퇴에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <Dropdown
        position="bottom"
        align="end"
        ariaLabel="사용자 메뉴"
        trigger={
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-body-s-bold text-gray-800 transition-colors hover:text-gray-600"
          >
            {user.name ?? '사용자'}
            <UserAvatar src={user.profileImage} alt={user.name ?? '프로필'} size={24} />
          </button>
        }
        items={[
          {
            id: 'logout',
            label: (
              <span className="flex items-center gap-1">
                로그아웃
                <LogoutIcon className="size-6" />
              </span>
            ),
            onClick: logout,
            variant: 'danger',
          },
          {
            id: 'withdraw',
            label: '회원 탈퇴',
            onClick: () => setIsWithdrawModalOpen(true),
            variant: 'danger',
          },
        ]}
      />

      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="회원 탈퇴"
        size="sm"
        closeOnBackdropClick={!isWithdrawing}
        closeOnEscape={!isWithdrawing}
      >
        <p className="text-body-m">
          탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
          <br />
          정말 탈퇴하시겠습니까?
        </p>
        <div className="mt-7 flex gap-3">
          <button
            className="flex-1 rounded-md bg-gray-100 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
            type="button"
            onClick={() => setIsWithdrawModalOpen(false)}
            disabled={isWithdrawing}
          >
            취소
          </button>
          <button
            className="flex-1 rounded-md bg-error py-3 font-bold text-white transition-colors hover:bg-error/90 disabled:opacity-50"
            type="button"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? '탈퇴 중...' : '탈퇴'}
          </button>
        </div>
      </Modal>
    </>
  );
}
