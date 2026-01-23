/**
 * 공유 모달 상태 관리 스토어
 *
 * 슬라이드/대본/영상 공유 워크플로우를 관리합니다.
 * form → result 단계로 진행되며, 공유 링크를 생성합니다.
 */
import { create } from 'zustand';

export type ShareType = 'slide_script' | 'slide_script_video';

interface ShareStoreState {
  isShareModalOpen: boolean;
  step: 'form' | 'result';
  shareType: ShareType;
  selectedVideoId: string | null;
  shareUrl: string;

  openShareModal: () => void;
  closeShareModal: () => void;
  setShareType: (type: ShareType) => void;
  setSelectedVideoId: (videoId: string | null) => void;
  generateShareLink: (params: {
    projectId: string;
    shareType: ShareType;
    selectedVideoId: string | null;
  }) => void;
  resetForm: () => void;
}

export const useShareStore = create<ShareStoreState>((set, get) => ({
  isShareModalOpen: false,
  step: 'form',
  shareType: 'slide_script',
  selectedVideoId: null,
  shareUrl: '',

  openShareModal: () => {
    set({
      isShareModalOpen: true,
      step: 'form',
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

  generateShareLink: ({ projectId, shareType, selectedVideoId }) => {
    const token = Math.random().toString(36).slice(2, 11);
    const base = 'https://ttorang.app/share';

    const query = new URLSearchParams();
    query.set('projectId', projectId);
    query.set('type', shareType);
    if (shareType === 'slide_script_video' && selectedVideoId) {
      query.set('videoId', selectedVideoId);
    }

    const shareUrl = `${base}/${token}?${query.toString()}`;

    set({
      shareUrl,
      step: 'result',
    });
  },

  resetForm: () =>
    set({
      step: 'form',
      shareType: 'slide_script',
      selectedVideoId: null,
      shareUrl: '',
    }),
}));
