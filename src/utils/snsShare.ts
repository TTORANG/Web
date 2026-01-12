import { toast } from 'sonner';

declare global {
  interface Window {
    Kakao?: unknown;
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
  if (!win) {
    toast.error('팝업이 차단되어 공유 창을 열 수 없습니다.');
  }
}

/* ================================
 * 2a. 카카오톡 공유
 * ================================ */
export async function shareToKakao(params: { jsKey: string; url: string; text?: string }) {
  const { jsKey, url, text = DEFAULT_SHARE_TEXT } = params;

  try {
    // SDK 로드
    if (!window.Kakao) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    }

    const Kakao = window.Kakao;
    if (!Kakao) throw new Error('Kakao SDK load failed');

    if (!Kakao.isInitialized()) {
      Kakao.init(jsKey);
    }

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '발표 자료 공유',
        description: text, // 요구사항 텍스트 반영
        imageUrl: 'https://via.placeholder.com/800x400.png?text=Share',
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: '링크 열기',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  } catch {
    toast.error('카카오 공유에 실패했습니다.');
  }
}

/* ================================
 * 2b. 인스타그램 (TODO: 불가능)
 * ================================ */
export function shareToInstagram() {
  toast.info('인스타그램은 웹에서 링크 공유를 직접 호출할 수 없습니다.');
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
