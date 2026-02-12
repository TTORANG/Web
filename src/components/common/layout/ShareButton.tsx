/**
 * @file ShareButton.tsx
 * @description 공유 모달을 여는 헤더 버튼
 */
import { useLocation } from 'react-router-dom';

import ShareIcon from '@/assets/icons/icon-share.svg?react';
import { useShareStore } from '@/stores/shareStore';

import { HeaderButton } from './HeaderButton';

export function ShareButton() {
  const openShareModal = useShareStore((s) => s.openShareModal);
  const { pathname } = useLocation();
  const isSlideRoute = /\/slide\/?$/.test(pathname);

  return (
    <HeaderButton
      text="공유"
      icon={<ShareIcon />}
      onClick={openShareModal}
      iconOnlyOnMobile={isSlideRoute}
    />
  );
}
