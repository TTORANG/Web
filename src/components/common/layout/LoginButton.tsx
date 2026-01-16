/**
 * @file LoginButton.tsx
 * @description 로그인 버튼 컴포넌트
 *
 * 헤더 우측에 표시되는 로그인 링크입니다.
 */
import LoginIcon from '@/assets/icons/icon-login.svg?react';
import { useAuthStore } from '@/stores/authStore.ts';

import { HeaderButton } from './HeaderButton.tsx';

export function LoginButton() {
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  return <HeaderButton text="로그인" icon={<LoginIcon />} onClick={openLoginModal} />;
}
