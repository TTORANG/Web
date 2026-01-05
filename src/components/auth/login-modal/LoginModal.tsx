import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import CloseIcon from '@/assets/icons/icon-close.svg?react';
import GoogleIcon from '@/assets/icons/icon-google.svg?react';
import KakaoIcon from '@/assets/icons/icon-kakao.svg?react';
import NaverIcon from '@/assets/icons/icon-naver.svg?react';
import LogoIcon from '@/assets/logo-icon.svg?react';
import { useAuthStore } from '@/stores/authStore';

import SocialLoginButton from './SocialLoginButton';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();

  useEffect(() => {
    if (!isLoginModalOpen) return;

    // Esc로 닫기
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal();
    };

    window.addEventListener('keydown', onKeyDown);

    // 모달이 열리면 바디 스크롤 잠금
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!isLoginModalOpen}
    >
      {/* 오버레이 */}
      <button
        type="button"
        aria-label="close overlay"
        className="absolute inset-0 cursor-default bg-black/80"
        onClick={closeLoginModal}
      />

      {/* 다이얼로그 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="로그인"
        className="relative z-10 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl bg-white px-6 py-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="close"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-lg transition cursor-pointer"
        >
          <CloseIcon />
        </button>

        {/* header */}
        <div className="flex flex-col items-center text-center">
          {/* 로고 영역 */}
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl">
            <LogoIcon />
          </div>

          <div className="flex gap-1.5 mb-10">
            <p className="text-main text-body-m-bold">또랑</p>
            <p className="text-body-m-bold">로그인</p>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col gap-2">
            <SocialLoginButton
              leftIcon={<GoogleIcon />}
              label="구글로 계속하기"
              className="bg-[#F5F6F8]  cursor-pointer"
            />

            <SocialLoginButton
              leftIcon={<NaverIcon />}
              label="네이버로 계속하기"
              className="bg-[#2DB400] text-white cursor-pointer"
            />

            <SocialLoginButton
              leftIcon={<KakaoIcon />}
              label="카카오로 계속하기"
              className="bg-[#F7E600] cursor-pointer"
            />
          </div>

          {/* footer text */}
          <p className="text-caption text-gray-500 text-center mt-4">
            로그인하면 또랑의 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
