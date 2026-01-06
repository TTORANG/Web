/**
 * @file LoginButton.tsx
 * @description 로그인 버튼 컴포넌트
 *
 * 헤더 우측에 표시되는 로그인 링크입니다.
 */
import LoginIcon from '@/assets/icons/icon-login.svg?react';
import { useAuthStore } from '@/stores/authStore';

export function LoginButton() {
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  return (
    <button
      type="button"
      onClick={openLoginModal}
      className="flex items-center gap-1 text-body-s-bold text-gray-800 cursor-pointer"
    >
      로그인
      <LoginIcon />
    </button>
  );
}
