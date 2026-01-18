// src/stores/shareStore.ts
import { create } from 'zustand';

/**
 * 공유 모달에서 사용할 '공유 타입'
 * - slide_script: "슬라이드 + 대본"
 * - slide_script_video: "슬라이드 + 대본 + 영상"
 */
export type ShareType = 'slide_script' | 'slide_script_video';

// ShareStoreState는 "공유 모달의 전역 상태"를 정의
interface ShareStoreState {
  // 모달이 열려있는지 여부 (LoginModal의 isLoginModalOpen과 동일한 역할)
  isShareModalOpen: boolean;

  // 모달 내부 단계
  // - form: 공유 옵션 선택/영상 선택/링크 생성 버튼이 보이는 단계
  // - result: 링크 생성이 끝나고 링크+SNS 공유 화면이 보이는 단계
  step: 'form' | 'result';

  // 현재 선택된 공유 유형
  shareType: ShareType;

  // 공유할 녹화 영상 id (공유 유형이 영상 포함일 때만 의미 있음)
  selectedVideoId: string | null;

  // 생성된 공유 링크
  shareUrl: string;

  // actions (상태 변경 함수들)
  openShareModal: () => void;
  closeShareModal: () => void;

  setShareType: (type: ShareType) => void;
  setSelectedVideoId: (videoId: string | null) => void;

  // "공유 링크 생성"을 눌렀을 때 실행할 함수
  // 실제 서비스라면 API 요청해서 링크를 받아오겠지만,
  // 지금 시점에서는 임시 토큰을 생성한다.
  generateShareLink: (params: {
    projectId: string;
    shareType: ShareType;
    selectedVideoId: string | null; // 첫번째 옵션일땐 비디오 없으니까 null
  }) => void;

  // 결과 화면에서 "닫기" 또는 다시 시작 등을 위한 초기화
  resetForm: () => void;
}

/**
 * useShareStore라는 "전역 store 훅" 만들기
 * 상태가 바뀌면, 그 상태를 구독(useShareStore로 읽는)하는 컴포넌트만 다시 렌더된다.
 */
export const useShareStore = create<ShareStoreState>((set, get) => ({
  // 기본값 세팅
  isShareModalOpen: false,
  step: 'form',
  shareType: 'slide_script',
  selectedVideoId: null,
  shareUrl: '',

  openShareModal: () => {
    // 모달을 열 때는 form 단계로 보여주는 게 자연스럽다
    // (이전 결과 화면이 남아있지 않게)
    set({
      isShareModalOpen: true,
      step: 'form',
      shareUrl: '',
    });
  },

  closeShareModal: () => {
    // 닫을 때는 모달만 닫고, resetForm은 애니메이션 완료 후 호출
    set({ isShareModalOpen: false });
  },

  setShareType: (type) => {
    // 공유 유형을 바꾸면,
    // 영상 포함이 아닌데 selectedVideoId가 남아있으면 혼란이 생길 수 있다.
    set({
      shareType: type,
      selectedVideoId: type === 'slide_script_video' ? get().selectedVideoId : null,
    });
  },

  setSelectedVideoId: (videoId) => set({ selectedVideoId: videoId }),

  generateShareLink: ({ projectId, shareType, selectedVideoId }) => {
    // 여기서는 임시로 토큰 생성 (실서비스에서는 API 응답값을 사용)
    const token = Math.random().toString(36).slice(2, 11); // 간단 토큰
    const base = 'https://ttorang.app/share'; // 시안 형태

    // shareType/영상 정보를 링크에 쿼리로 넣고 싶다면 이렇게 구성 가능
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
