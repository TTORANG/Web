import { showToast } from '@/utils/toast.ts';

/**
 * Kakao JS SDK에서 우리가 쓰는 최소 스펙만 타입으로 선언
 * (any 금지 규칙 통과 + 필요한 속성만 안전하게 접근)
 */
type KakaoShareLink = {
  webUrl?: string;
  mobileWebUrl?: string;
};

type KakaoSendDefaultParams = {
  objectType: 'feed';
  content: {
    title: string;
    description?: string;
    imageUrl?: string;
    link: KakaoShareLink;
  };
  buttons?: Array<{
    title: string;
    link: KakaoShareLink;
  }>;
};

type KakaoSDK = {
  isInitialized: () => boolean;
  init: (jsKey: string) => void;
  Share: {
    /**
     * 공식 문서: 직접 만든 버튼 사용 시 createDefaultButton 대신 sendDefault 사용
     */
    sendDefault: (params: KakaoSendDefaultParams) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

/**
 * 기본 공유 문구
 */
const DEFAULT_SHARE_TEXT = '내 발표를 확인하고 피드백을 남겨주세요!';

/**
 * 공통: encode 처리
 */
function encode(value: string) {
  return encodeURIComponent(value);
}

/**
 * 공통: 새 창 열기
 */
function openNewTab(url: string) {
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) showToast.error('공유 창을 열 수 없습니다.', '팝업 차단을 해제해주세요.');
}

/**
 * Kakao SDK 스크립트를 head에 직접 삽입
 */
async function loadKakaoSdk(): Promise<void> {
  // 이미 로드되어 있으면 끝
  if (window.Kakao) return;

  await new Promise<void>((resolve, reject) => {
    // 중복 삽입 방지
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Kakao SDK load error')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.dataset.kakaoSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao SDK load error'));
    document.head.appendChild(script);
  });
}

/* ================================
 * 2a. 카카오톡 공유
 * ================================ */
// kakao.js SDK를 먼저 내려받고
// init을 거친 후
// sendDefault를 호출할 수 있다.
export async function shareToKakao(params: {
  jsKey: string;
  url: string;
  text?: string;
  title?: string;
  imageUrl?: string;
}) {
  const {
    jsKey,
    url,
    text = DEFAULT_SHARE_TEXT,
    title = '발표 자료 공유',
    imageUrl = 'https://via.placeholder.com/800x400.png?text=Share',
  } = params;

  try {
    if (!jsKey) {
      showToast.error('Kakao JS Key가 비어 있습니다.', 'VITE_KAKAO_JS_KEY를 확인해주세요.');
      return;
    }
    if (!url) {
      showToast.error('공유할 URL이 비어 있습니다.');
      return;
    }

    // 1) SDK 로드
    await loadKakaoSdk();

    // 2) 로드 후 Kakao 객체 확인
    const Kakao = window.Kakao;
    if (!Kakao) {
      showToast.error('Kakao SDK 로드에 실패했습니다.');
      return;
    }

    // 3) 초기화 (한 번만)
    if (!Kakao.isInitialized()) {
      Kakao.init(jsKey);
    }

    // 4) "직접 만든 버튼"이므로 sendDefault로 호출
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description: text,
        imageUrl,
        link: {
          webUrl: url,
          mobileWebUrl: url,
        },
      },
      buttons: [
        {
          title: '링크 열기',
          link: {
            webUrl: url,
            mobileWebUrl: url,
          },
        },
      ],
    });
  } catch (e) {
    // 네트워크/스크립트 로드 실패/도메인 미등록 등 전부 여기로 떨어질 수 있음
    console.error(e);
    showToast.error('카카오 공유에 실패했습니다.', 'JS SDK 도메인/키/URL을 확인해주세요.');
  }
}

/* ================================
 * 2b. 인스타그램 (TODO: 불가능)
 * ================================ */
export function shareToInstagram() {
  showToast.info('인스타그램 공유 불가', '웹에서 링크 공유를 직접 호출할 수 없습니다.');
}

/* ================================
 * 2c. X 공유
 * ================================ */
export function shareToX(params: { url: string; text?: string }) {
  const { url, text = DEFAULT_SHARE_TEXT } = params;
  const shareUrl =
    `https://twitter.com/intent/tweet` + `?url=${encode(url)}` + `&text=${encode(text)}`;

  openNewTab(shareUrl);
}

/* ================================
 * 2d. 페이스북 공유
 * ================================ */
export function shareToFacebook(params: { url: string }) {
  const { url } = params;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php` + `?u=${encode(url)}`;
  openNewTab(shareUrl);
}
