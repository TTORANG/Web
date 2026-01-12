/**
 * @file
 * @description
 *
 * 헤더 우측에 표시되는 공유 링크입니다.
 */
import ShareIcon from '@/assets/icons/icon-share.svg?react';
import { useShareStore } from '@/stores/shareStore';

export function ShareButton() {
  const openShareModal = useShareStore((s) => s.openShareModal);

  return (
    <button
      type="button"
      onClick={openShareModal}
      className="flex items-center gap-1 text-body-s-bold text-gray-800 cursor-pointer"
    >
      공유
      <ShareIcon />
    </button>
  );
}
