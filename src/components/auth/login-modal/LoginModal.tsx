import LogoIcon from '@/assets/logo-icon.svg?react';
import GoogleIcon from '@/assets/social-icons/login-google.png';
import KakaoIcon from '@/assets/social-icons/login-kakao.svg?react';
// import NaverIcon from '@/assets/social-icons/login-naver.svg?react';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/stores/authStore';
import type { AuthProvider } from '@/types/auth';

import SocialLoginButton from './SocialLoginButton';

// 로그인은 항상 실제 백엔드 서버로 요청 (MSW 모킹과 무관)
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL;

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();

  const handleSocialLogin = (provider: AuthProvider) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${AUTH_API_URL}/auth/${provider}/login`,
      'oauth-popup',
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  return (
    <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal} size="sm" noPadding>
      <div className="px-6 pb-8 pt-13">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl">
            <LogoIcon />
          </div>
          <div className="flex gap-1.5 mb-10">
            <p className="text-main text-body-m-bold">또랑</p>
            <p className="text-body-m-bold">로그인</p>
          </div>
        </header>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-2">
          <SocialLoginButton
            leftIcon={<img src={GoogleIcon} alt="Google" className="size-10" />}
            label="구글로 계속하기"
            className="bg-[#F5F6F8] text-[#1a1a1a] cursor-pointer"
            onClick={() => handleSocialLogin('google')}
          />
          {/*
          <SocialLoginButton
            leftIcon={<NaverIcon />}
            label="네이버로 계속하기"
            className="bg-[#2DB400] text-[#ffffff] cursor-pointer"
            onClick={() => handleSocialLogin('naver')}
          />
          */}
          <SocialLoginButton
            leftIcon={<KakaoIcon />}
            label="카카오로 계속하기"
            className="bg-[#F7E600] text-[#1a1a1a] cursor-pointer"
            onClick={() => handleSocialLogin('kakao')}
          />
        </div>

        {/* Footer */}
        <p className="text-caption text-gray-600 text-center mt-4">
          로그인하면 또랑의 서비스 약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </Modal>
  );
}
