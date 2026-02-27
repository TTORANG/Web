/**
 * @file ShareButton.tsx
 * @description 공유 모달을 여는 헤더 버튼
 */
import ShareIcon from '@/assets/icons/icon-share.svg?react';
import { useShareStore } from '@/stores/shareStore';

import { HeaderButton } from './HeaderButton';

export function ShareButton() {
  const openShareModal = useShareStore((s) => s.openShareModal);

  return (
    <HeaderButton
      text="공유"
      icon={<ShareIcon />}
      onClick={openShareModal}
      iconOnlyOnMobile
      className="rounded-full bg-main px-3 text-white hover:bg-main-variant2 hover:text-white active:bg-main-variant1 focus-visible:outline-white focus-visible:outline-offset-2 lg:gap-2 lg:px-4"
    />
  );
}
