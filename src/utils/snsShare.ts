/**
 * @file snsShare.ts
 * @description SNS 공유 유틸리티 (카카오톡, X, 페이스북, 인스타그램)
 */
import { showToast } from '@/utils/toast.ts';

/* ─────────────────────────────────────────────────────────────
 * Kakao SDK 타입 정의
 * ───────────────────────────────────────────────────────────── */

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
    sendDefault: (params: KakaoSendDefaultParams) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

/* ─────────────────────────────────────────────────────────────
 * 내부 유틸리티
 * ───────────────────────────────────────────────────────────── */

const DEFAULT_SHARE_TEXT = '내 발표를 확인하고 피드백을 남겨주세요!';

function encode(value: string) {
  return encodeURIComponent(value);
}

/** 새 탭에서 URL 열기. 팝업 차단 시 토스트 표시 */
function openNewTab(url: string) {
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) showToast.error('공유 창을 열 수 없습니다.', '팝업 차단을 해제해주세요.');
}

/** Kakao SDK 스크립트를 동적으로 로드 */
async function loadKakaoSdk(): Promise<void> {
  if (window.Kakao) return;

  await new Promise<void>((resolve, reject) => {
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

/* ─────────────────────────────────────────────────────────────
 * 공유 함수
 * ───────────────────────────────────────────────────────────── */

/**
 * 카카오톡으로 공유
 *
 * @param params.jsKey - 카카오 JavaScript 키 (VITE_KAKAO_JS_KEY)
 * @param params.url - 공유할 URL
 * @param params.text - 공유 메시지 (기본: DEFAULT_SHARE_TEXT)
 * @param params.title - 카드 제목 (기본: '발표 자료 공유')
 * @param params.imageUrl - 미리보기 이미지 URL
 */
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

    await loadKakaoSdk();

    const Kakao = window.Kakao;
    if (!Kakao) {
      showToast.error('Kakao SDK 로드에 실패했습니다.');
      return;
    }

    if (!Kakao.isInitialized()) {
      Kakao.init(jsKey);
    }

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description: text,
        imageUrl,
        link: { webUrl: url, mobileWebUrl: url },
      },
      buttons: [{ title: '링크 열기', link: { webUrl: url, mobileWebUrl: url } }],
    });
  } catch (e) {
    console.error(e);
    showToast.error('카카오 공유에 실패했습니다.', 'JS SDK 도메인/키/URL을 확인해주세요.');
  }
}

/**
 * 인스타그램 공유 (웹에서 직접 호출 불가)
 */
export function shareToInstagram() {
  showToast.info('인스타그램 공유 불가', '웹에서 링크 공유를 직접 호출할 수 없습니다.');
}

/**
 * X(트위터)로 공유
 *
 * @param params.url - 공유할 URL
 * @param params.text - 공유 메시지
 */
export function shareToX(params: { url: string; text?: string }) {
  const { url, text = DEFAULT_SHARE_TEXT } = params;
  const shareUrl = `https://twitter.com/intent/tweet?url=${encode(url)}&text=${encode(text)}`;
  openNewTab(shareUrl);
}

/**
 * 페이스북으로 공유
 *
 * @param params.url - 공유할 URL
 */
export function shareToFacebook(params: { url: string }) {
  const { url } = params;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`;
  openNewTab(shareUrl);
}
