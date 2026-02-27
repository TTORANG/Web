import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import IconCopy from '@/assets/icons/icon-copy.svg?react';
import instagramIcon from '@/assets/sns-icons/instagram-icon@4x.webp';
import kakaoTalkIcon from '@/assets/sns-icons/kakaotalk-icon@4x.webp';
import xIcon from '@/assets/sns-icons/x-icon@4x.webp';
import { Modal } from '@/components/common/Modal';
import { DEMO_SHAREABLE_VIDEOS, DEMO_SHARE_PATH, isDemoProject } from '@/constants/demoProject';
import { useCreateShareLink, useShareableVideos } from '@/hooks/queries/useShares';
import { type ShareType, useShareStore } from '@/stores/shareStore';
import { formatTimestamp } from '@/utils/format';
import { buildQrCodeDataUrl, shareQrToInstagram, shareToKakao, shareToX } from '@/utils/snsShare';
import { showToast } from '@/utils/toast';

const KAKAO_JS_KEY = import.meta.env?.VITE_KAKAO_JS_KEY ?? '';
const SHARE_TEXT = '내 발표를 확인하고 피드백을 남겨주세요!';

type ShareGenerationTarget = {
  scope: 'slides_script' | 'slides_script_video';
  videoId?: string;
  key: string;
};

export function ShareModal() {
  const { projectId } = useParams<{ projectId: string }>();
  const isDemoMode = isDemoProject(projectId);

  const isOpen = useShareStore((s) => s.isShareModalOpen);
  const shareType = useShareStore((s) => s.shareType);
  const selectedVideoId = useShareStore((s) => s.selectedVideoId);
  const shareUrl = useShareStore((s) => s.shareUrl);

  const close = useShareStore((s) => s.closeShareModal);
  const setShareType = useShareStore((s) => s.setShareType);
  const setSelectedVideoId = useShareStore((s) => s.setSelectedVideoId);
  const resetForm = useShareStore((s) => s.resetForm);
  const setShareUrl = useShareStore((s) => s.setShareUrl);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const requestSeqRef = useRef(0);
  const activeRequestIdRef = useRef(0);
  const inFlightKeyRef = useRef(new Set<string>());
  const shareLinkCacheRef = useRef(new Map<string, string>());

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useShareableVideos(projectId, {
    enabled: !isDemoMode && isOpen && shareType === 'slide_script_video',
  });

  const { mutateAsync: mutateShareLink } = useCreateShareLink();

  const videos = useMemo(() => {
    if (isDemoMode) return DEMO_SHAREABLE_VIDEOS;
    if (!videosData?.pages) return [];
    return videosData.pages.flatMap(
      (page) => (page.resultType === 'SUCCESS' && page.success?.videos) || [],
    );
  }, [isDemoMode, videosData]);

  const prevShareTypeRef = useRef<ShareType>(shareType);
  useEffect(() => {
    const prevShareType = prevShareTypeRef.current;
    const isTypeChanged = prevShareType !== shareType;
    prevShareTypeRef.current = shareType;

    if (shareType !== 'slide_script_video') return;
    if (videos.length === 0) return;

    if (isTypeChanged || !selectedVideoId) {
      setSelectedVideoId(videos[0].id);
    }
  }, [shareType, videos, selectedVideoId, setSelectedVideoId]);

  const observerTarget = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isDemoMode) return;
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isDemoMode, isFetchingNextPage],
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element || isDemoMode) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, isDemoMode]);

  useEffect(() => {
    if (!isOpen) {
      activeRequestIdRef.current += 1;
      inFlightKeyRef.current.clear();
      shareLinkCacheRef.current.clear();
      setInlineError(null);
      setIsQrOpen(false);
      setIsGeneratingLink(false);
      setIsGeneratingQr(false);
      setQrCodeDataUrl('');
      return;
    }

    inFlightKeyRef.current.clear();
    shareLinkCacheRef.current.clear();
    setInlineError(null);
    setIsQrOpen(false);
    setIsGeneratingQr(false);
    setQrCodeDataUrl('');
  }, [isOpen]);

  const generationTarget = useMemo<ShareGenerationTarget | null>(() => {
    if (!projectId || !isOpen) return null;
    if (shareType === 'slide_script') {
      return { scope: 'slides_script', key: 'slides_script' };
    }
    if (!selectedVideoId) return null;
    return {
      scope: 'slides_script_video',
      videoId: selectedVideoId,
      key: `slides_script_video:${selectedVideoId}`,
    };
  }, [isOpen, projectId, shareType, selectedVideoId]);

  const generateShareLink = useCallback(
    async (target: ShareGenerationTarget, force = false) => {
      if (!projectId || isDemoMode) return;

      const cache = shareLinkCacheRef.current;
      const inFlightKeys = inFlightKeyRef.current;
      const cachedUrl = cache.get(target.key);

      if (!force && cachedUrl) {
        setShareUrl(cachedUrl);
        setInlineError(null);
        setIsGeneratingLink(false);
        return;
      }
      if (!force && inFlightKeys.has(target.key)) return;

      const requestId = ++requestSeqRef.current;
      activeRequestIdRef.current = requestId;
      inFlightKeys.add(target.key);
      setInlineError(null);
      setIsGeneratingLink(true);
      if (!cachedUrl) setShareUrl('');

      try {
        const response = await mutateShareLink({
          projectId,
          data: {
            scope: target.scope,
            videoId: target.videoId,
          },
        });

        inFlightKeys.delete(target.key);
        if (response.resultType === 'SUCCESS' && response.success) {
          const nextUrl = response.success.shareUrl;
          cache.set(target.key, nextUrl);
          if (activeRequestIdRef.current !== requestId) return;
          setShareUrl(nextUrl);
          setInlineError(null);
          return;
        }

        const errorMessage =
          response.resultType === 'FAILURE'
            ? response.error.reason || '공유 링크를 만들지 못했습니다.'
            : '응답을 처리하지 못했습니다.';
        if (activeRequestIdRef.current !== requestId) return;
        setShareUrl('');
        setInlineError(errorMessage);
      } catch {
        inFlightKeys.delete(target.key);
        if (activeRequestIdRef.current !== requestId) return;
        setShareUrl('');
        setInlineError('공유 링크를 만들지 못했습니다.');
      } finally {
        if (activeRequestIdRef.current === requestId) {
          setIsGeneratingLink(false);
        }
      }
    },
    [isDemoMode, mutateShareLink, projectId, setShareUrl],
  );

  useEffect(() => {
    if (!isOpen || !projectId || !isDemoMode) return;
    setInlineError(null);
    setIsGeneratingLink(false);
    setShareUrl(`${window.location.origin}${DEMO_SHARE_PATH}`);
  }, [isDemoMode, isOpen, projectId, setShareUrl]);

  useEffect(() => {
    if (!isOpen || isDemoMode) return;
    if (!generationTarget) {
      setShareUrl('');
      setIsGeneratingLink(false);
      return;
    }

    const cachedUrl = shareLinkCacheRef.current.get(generationTarget.key);
    if (cachedUrl) {
      setShareUrl(cachedUrl);
      setInlineError(null);
      setIsGeneratingLink(false);
      return;
    }

    void generateShareLink(generationTarget);
  }, [generateShareLink, generationTarget, isDemoMode, isOpen, setShareUrl]);

  const handleRetry = useCallback(() => {
    if (isDemoMode || !generationTarget) return;
    void generateShareLink(generationTarget, true);
  }, [generateShareLink, generationTarget, isDemoMode]);

  const isShareActionDisabled = !shareUrl || isGeneratingLink;

  const handleCopy = useCallback(async () => {
    if (!shareUrl || isGeneratingLink) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast.success('링크를 복사했습니다.');
    } catch {
      showToast.error('링크를 복사하지 못했습니다.');
    }
  }, [isGeneratingLink, shareUrl]);

  useEffect(() => {
    if (!shareUrl) {
      setIsGeneratingQr(false);
      setQrCodeDataUrl('');
      return;
    }
    if (!isQrOpen) {
      setIsGeneratingQr(false);
      return;
    }

    let cancelled = false;
    setIsGeneratingQr(true);

    void buildQrCodeDataUrl(shareUrl, 320)
      .then((dataUrl) => {
        if (cancelled) return;
        setQrCodeDataUrl(dataUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setQrCodeDataUrl('');
        showToast.warning('QR 코드를 생성하지 못했습니다.', '잠시 후 다시 시도해주세요.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsGeneratingQr(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isQrOpen, shareUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      onAfterClose={resetForm}
      closeOnEscape={!isQrOpen}
      closeOnBackdropClick={!isQrOpen}
      title="발표 자료 공유"
      className="w-148.5 max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)]"
    >
      <div className="flex max-h-[calc(100vh-11rem)] flex-col">
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4 pb-2">
            <div className="flex flex-col gap-2">
              <p className="text-body-m-bold text-gray-600">공유 유형</p>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setShareType('slide_script')}
                  className={clsx(
                    'h-10 rounded-lg text-body-s-bold transition-colors',
                    shareType === 'slide_script'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800',
                  )}
                >
                  발표 자료
                </button>
                <button
                  type="button"
                  onClick={() => setShareType('slide_script_video')}
                  className={clsx(
                    'h-10 rounded-lg text-body-s-bold transition-colors',
                    shareType === 'slide_script_video'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800',
                  )}
                >
                  리허설 영상
                </button>
              </div>
              <p className="text-caption text-gray-600">
                {shareType === 'slide_script'
                  ? '슬라이드와 대본이 공유 링크에 포함됩니다.'
                  : '선택한 리허설 영상과 발표 자료가 함께 공유됩니다.'}
              </p>
            </div>

            {shareType === 'slide_script_video' && (
              <div className="flex flex-col gap-2">
                <p className="text-body-m-bold text-gray-600">공유할 리허설 영상</p>
                <div className="max-h-[10.5rem] overflow-y-auto rounded-lg border border-gray-200 md:max-h-[11.5rem]">
                  {isLoadingVideos ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-body-m text-gray-600">영상 목록을 불러오는 중...</span>
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-body-m text-gray-600">
                        공유 가능한 영상이 없습니다.
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {videos.map((video) => {
                        const active = video.id === selectedVideoId;
                        return (
                          <button
                            key={video.id}
                            type="button"
                            onClick={() => setSelectedVideoId(video.id)}
                            className={clsx(
                              'flex w-full items-center gap-4 px-4 py-3 text-left transition-colors',
                              active ? 'bg-main-variant1' : 'bg-white hover:bg-gray-100',
                            )}
                          >
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="h-14 w-24 rounded-sm object-cover"
                              />
                            ) : (
                              <div className="h-14 w-24 rounded-sm bg-gray-200" />
                            )}
                            <div className="flex min-w-0 flex-col gap-1">
                              <span
                                className={clsx(
                                  'truncate text-body-m-bold',
                                  active ? 'text-white' : 'text-gray-800',
                                )}
                              >
                                {video.title}
                              </span>
                              <span
                                className={clsx(
                                  'text-caption',
                                  active ? 'text-white/80' : 'text-gray-600',
                                )}
                              >
                                {formatTimestamp(video.createdAt)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {!isDemoMode && <div ref={observerTarget} className="h-4 w-full" />}
                      {!isDemoMode && isFetchingNextPage && (
                        <div className="flex items-center justify-center py-3">
                          <span className="text-body-s text-gray-600">
                            추가 영상을 불러오는 중...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-body-m-bold text-gray-600">공유 링크</p>
              <div className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4">
                {isGeneratingLink ? (
                  <span className="text-body-s text-gray-600">공유 링크를 생성하는 중...</span>
                ) : shareUrl ? (
                  <input
                    value={shareUrl}
                    readOnly
                    className="w-full bg-transparent text-body-s text-gray-800 outline-none"
                  />
                ) : (
                  <span className="text-body-s text-gray-500">공유 링크를 준비하고 있습니다.</span>
                )}
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  disabled={isShareActionDisabled}
                  className={clsx(
                    'rounded-md p-2 transition-colors',
                    isShareActionDisabled
                      ? 'cursor-not-allowed text-gray-400'
                      : 'text-gray-800 hover:bg-gray-100',
                  )}
                  aria-label="링크 복사"
                >
                  <IconCopy className="h-4 w-4" />
                </button>
              </div>

              {inlineError && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2">
                  <span className="text-body-s text-red-700">{inlineError}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="shrink-0 rounded-md px-2 py-1 text-body-s-bold text-red-700 hover:bg-red-100"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-body-m-bold text-gray-600">외부로 공유하기</p>
              <div className="grid grid-cols-4 gap-1 md:gap-3">
                <button
                  type="button"
                  aria-label="카카오톡으로 공유"
                  disabled={isShareActionDisabled}
                  onClick={() => {
                    if (!KAKAO_JS_KEY) {
                      showToast.error(
                        '카카오 공유 설정을 확인해주세요.',
                        '.env 값을 확인해주세요.',
                      );
                      return;
                    }
                    shareToKakao({
                      jsKey: KAKAO_JS_KEY,
                      url: shareUrl,
                      text: SHARE_TEXT,
                      title: '발표 자료 공유',
                    });
                  }}
                  className={clsx(
                    'flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1 transition-colors md:h-[5.5rem] md:flex-col md:gap-1.5',
                    isShareActionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100',
                  )}
                >
                  <img
                    src={kakaoTalkIcon}
                    alt=""
                    aria-hidden
                    className="h-4.5 w-4.5 md:h-9 md:w-9"
                  />
                  <span className="text-caption-bold text-gray-800 md:hidden">카카오</span>
                  <span className="hidden text-body-s-bold text-gray-800 md:inline">카카오톡</span>
                </button>

                <button
                  type="button"
                  aria-label="인스타그램으로 공유"
                  disabled={isShareActionDisabled}
                  onClick={() => void shareQrToInstagram({ url: shareUrl })}
                  className={clsx(
                    'flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1 transition-colors md:h-[5.5rem] md:flex-col md:gap-1.5',
                    isShareActionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100',
                  )}
                >
                  <img
                    src={instagramIcon}
                    alt=""
                    aria-hidden
                    className="h-4.5 w-4.5 md:h-9 md:w-9"
                  />
                  <span className="text-caption-bold text-gray-800 md:hidden">인스타</span>
                  <span className="hidden text-body-s-bold text-gray-800 md:inline">
                    인스타그램
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="X로 공유"
                  disabled={isShareActionDisabled}
                  onClick={() =>
                    shareToX({
                      url: shareUrl,
                      text: SHARE_TEXT,
                    })
                  }
                  className={clsx(
                    'flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1 transition-colors md:h-[5.5rem] md:flex-col md:gap-1.5',
                    isShareActionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100',
                  )}
                >
                  <img src={xIcon} alt="" aria-hidden className="h-4.5 w-4.5 md:h-9 md:w-9" />
                  <span className="text-caption-bold text-gray-800">X</span>
                </button>

                <button
                  type="button"
                  aria-label="QR 코드 보기"
                  disabled={isShareActionDisabled}
                  onClick={() => setIsQrOpen(true)}
                  className={clsx(
                    'flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1 transition-colors md:h-[5.5rem] md:flex-col md:gap-1.5',
                    isShareActionDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100',
                  )}
                >
                  <div className="grid h-4.5 w-4.5 place-items-center rounded border border-gray-300 text-gray-700 md:h-9 md:w-9 md:rounded-md">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 md:h-5 md:w-5"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M3 3h7v7H3zM5 5v3h3V5zm9-2h7v7h-7zm2 2v3h3V5zM3 14h7v7H3zm2 2v3h3v-3zM14 14h2v2h-2zM17 14h4v2h-2v2h2v3h-2v-1h-2zM14 17h2v4h-2zM17 19h2v2h-2z" />
                    </svg>
                  </div>
                  <span className="text-caption-bold text-gray-800 md:hidden">QR</span>
                  <span className="hidden text-body-s-bold text-gray-800 md:inline">QR 코드</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 shrink-0 pt-3">
          <button
            type="button"
            onClick={close}
            className="h-12 w-full rounded-lg bg-gray-100 text-body-s-bold text-main hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
      <Modal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        onAfterClose={() => {
          setIsGeneratingQr(false);
          setQrCodeDataUrl('');
        }}
        title="공유 QR 코드"
        className="w-90 max-w-[calc(100vw-32px)]"
      >
        <div className="flex flex-col items-center gap-3">
          {isGeneratingQr ? (
            <p className="text-body-s text-gray-600">QR 코드를 생성하는 중...</p>
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="공유 링크 QR 코드"
              className="h-64 w-64 rounded-md border border-gray-200"
            />
          ) : (
            <p className="text-body-s text-gray-600">QR 코드를 생성하지 못했습니다.</p>
          )}
        </div>
      </Modal>
    </Modal>
  );
}
