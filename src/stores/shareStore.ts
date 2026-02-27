/**
 * 공유 모달 상태 관리 스토어
 *
 * 슬라이드/대본/영상 공유 워크플로우를 관리합니다.
 */
import { create } from 'zustand';

export type ShareType = 'slide_script' | 'slide_script_video';

interface ShareStoreState {
  isShareModalOpen: boolean;
  shareType: ShareType;
  selectedVideoId: string | null;
  shareUrl: string;

  openShareModal: () => void;
  closeShareModal: () => void;
  setShareType: (type: ShareType) => void;
  setSelectedVideoId: (videoId: string | null) => void;
  setShareUrl: (url: string) => void;
  resetForm: () => void;
}

export const useShareStore = create<ShareStoreState>((set, get) => ({
  isShareModalOpen: false,
  shareType: 'slide_script',
  selectedVideoId: null,
  shareUrl: '',

  openShareModal: () => {
    set({
      isShareModalOpen: true,
      shareUrl: '',
    });
  },

  closeShareModal: () => {
    set({
      isShareModalOpen: false,
    });
  },

  setShareType: (type) => {
    set({
      shareType: type,
      selectedVideoId: type === 'slide_script_video' ? get().selectedVideoId : null,
    });
  },

  setSelectedVideoId: (videoId) => set({ selectedVideoId: videoId }),

  setShareUrl: (url) => set({ shareUrl: url }),

  resetForm: () =>
    set({
      shareType: 'slide_script',
      selectedVideoId: null,
      shareUrl: '',
    }),
}));
