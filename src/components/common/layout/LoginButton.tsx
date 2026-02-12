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
import { Popover } from '@/components/common/Popover';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useHomeStore } from '@/stores/homeStore';
import { isAnonymousEmail } from '@/utils/auth';
import { showToast } from '@/utils/toast';
import { getUserDisplayName } from '@/utils/user';

import { HeaderButton } from './HeaderButton';
import { WithdrawConfirmModal } from './WithdrawConfirmModal';

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
      <Popover
        key={`${accessToken ?? 'guest'}-${user?.id ?? 'nouser'}`}
        position="bottom"
        align="end"
        ariaLabel="사용자 메뉴"
        className="mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_0.5rem_1.25rem_rgba(0,0,0,0.08)]"
        trigger={({ isOpen }) => (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 text-body-s-bold text-gray-800 transition-colors hover:bg-gray-100"
          >
            <span className="max-w-24 truncate">{displayName}</span>
            <UserAvatar src={user.profileImage} alt={displayName} size={24} />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      >
        {({ close }) => (
          <div className="p-3">
            <div className="rounded-lg border border-gray-200 px-3 py-3">
              <p className="text-caption-bold text-gray-600">내 계정</p>
              <div className="mt-2 flex items-center gap-3">
                <UserAvatar src={user.profileImage} alt={displayName} size={42} />
                <div className="min-w-0">
                  <p className="truncate text-body-m-bold text-gray-800">{displayName}</p>
                  <p className="truncate text-caption text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 border-t border-gray-200 pt-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-body-s text-gray-800 transition-colors hover:bg-gray-100"
                onClick={() => {
                  close();
                  handleLogout();
                }}
              >
                <div>
                  <p className="text-body-s-bold">로그아웃</p>
                  <p className="text-caption text-gray-600">현재 계정에서 로그아웃합니다.</p>
                </div>
                <LogoutIcon className="size-5 text-gray-400" />
              </button>
            </div>

            <div className="mt-1 border-t border-gray-200 pt-2">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100"
                onClick={() => {
                  close();
                  setIsWithdrawModalOpen(true);
                }}
              >
                <p className="text-caption-bold text-error">회원 탈퇴</p>
                <p className="text-caption text-gray-600">
                  계정과 데이터가 삭제되며 되돌릴 수 없습니다.
                </p>
              </button>
            </div>
          </div>
        )}
      </Popover>

      <WithdrawConfirmModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdraw}
        isPending={isWithdrawing}
      />
    </>
  );
}
