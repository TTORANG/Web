/**
 * @file LoginButton.tsx
 * @description 로그인/프로필 버튼 컴포넌트
 *
 * 비로그인 상태: 로그인 버튼 (클릭 시 로그인 모달)
 * 로그인 상태: 사용자 이름 + 프로필 이미지 (클릭 시 로그아웃/회원탈퇴 드롭다운)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import LoginIcon from '@/assets/icons/icon-login.svg?react';
import LogoutIcon from '@/assets/icons/icon-logout.svg?react';
import { Dropdown } from '@/components/common/Dropdown';
import { Modal } from '@/components/common/Modal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useHomeStore } from '@/stores/homeStore';
import { isAnonymousEmail } from '@/utils/auth';
import { showToast } from '@/utils/toast';
import { getUserDisplayName } from '@/utils/user';

import { HeaderButton } from './HeaderButton';

export function LoginButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const logout = useAuthStore((s) => s.logout);
  const resetHome = useHomeStore((s) => s.reset);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isGuest = !accessToken;
  const isAnon = accessToken && isAnonymousEmail(user?.email);
  const isSocial = accessToken && user?.email && !isAnonymousEmail(user.email);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    resetHome();
    showToast.success('로그아웃 완료');
    navigate('/', { replace: true });
    window.scrollTo({ top: 0 });
  };
  // 로그인 전 (게스트)
  if (isGuest) {
    return <HeaderButton text="로그인" icon={<LoginIcon />} onClick={openLoginModal} />;
  }

  // 익명 사용자
  if (isAnon || !user) {
    return <HeaderButton text="익명 사용자(로그인)" icon={null} onClick={openLoginModal} />;
  }

  // 소셜이 아닌데 여기까지 왔다면(비정상 상태) 방어
  if (!isSocial) {
    return <HeaderButton text="로그인" icon={<LoginIcon />} onClick={openLoginModal} />;
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await apiClient.delete(`/users/${user.id}`);
      handleLogout();
      setIsWithdrawModalOpen(false);
      showToast.success('회원 탈퇴가 완료되었습니다.');
    } catch {
      showToast.error('회원 탈퇴에 실패했습니다.', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const displayName = getUserDisplayName(user, '사용자');

  return (
    <>
      <Dropdown
        key={`${accessToken ?? 'guest'}-${user?.id ?? 'nouser'}`}
        position="bottom"
        align="end"
        ariaLabel="사용자 메뉴"
        trigger={
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-body-s-bold text-gray-800 transition-colors hover:text-gray-600"
          >
            {displayName}
            <UserAvatar src={user.profileImage} alt={displayName} size={24} />
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
            onClick: handleLogout,
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
