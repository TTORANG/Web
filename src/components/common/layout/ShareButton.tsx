import ShareIcon from '@/assets/icons/icon-share.svg?react';
import { useShareStore } from '@/stores/shareStore';

import { HeaderButton } from './HeaderButton';

export function ShareButton() {
  const openShareModal = useShareStore((s) => s.openShareModal);

  return <HeaderButton text="공유" icon={<ShareIcon />} onClick={openShareModal} />;
}
