import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import IconCopy from '@/assets/icons/icon-copy.svg?react';
import IconLink from '@/assets/icons/icon-link.svg?react';
import facebookIcon from '@/assets/sns-icons/facebook-icon@4x.webp';
import instagramIcon from '@/assets/sns-icons/instagram-icon@4x.webp';
import kakaoTalkIcon from '@/assets/sns-icons/kakaotalk-icon@4x.webp';
import xIcon from '@/assets/sns-icons/x-icon@4x.webp';
import { Dropdown, type DropdownItem } from '@/components/common/Dropdown';
import { Modal } from '@/components/common/Modal';
import { useCreateShareLink, useShareableVideos } from '@/hooks/queries/useShares';
import { type ShareType, useShareStore } from '@/stores/shareStore';
import { formatTimestamp } from '@/utils/format';
import { shareToFacebook, shareToInstagram, shareToKakao, shareToX } from '@/utils/snsShare';
import { showToast } from '@/utils/toast';

const KAKAO_JS_KEY = import.meta.env?.VITE_KAKAO_JS_KEY ?? '';
const SHARE_TEXT = '내 발표를 확인하고 피드백을 남겨주세요!';
// 화면에 표시할 공유 타입 보여주기
function shareTypeLabel(type: ShareType) {
  return type === 'slide_script' ? '슬라이드 + 대본' : '슬라이드 + 대본 + 영상';
}
export function ShareModal() {
  const { projectId } = useParams<{ projectId: string }>();
  // zustand 값 구독(읽기)
  const isOpen = useShareStore((s) => s.isShareModalOpen);
  const step = useShareStore((s) => s.step);
  const shareType = useShareStore((s) => s.shareType);
  const selectedVideoId = useShareStore((s) => s.selectedVideoId);
  const shareUrl = useShareStore((s) => s.shareUrl);
  // zustand store 액션 구독
  const close = useShareStore((s) => s.closeShareModal);
  const setShareType = useShareStore((s) => s.setShareType);
  const setSelectedVideoId = useShareStore((s) => s.setSelectedVideoId);
  const resetForm = useShareStore((s) => s.resetForm);
  const setShareUrl = useShareStore((s) => s.setShareUrl);
  const setStep = useShareStore((s) => s.setStep);

  // 공유 가능 영상 목록 조회 (모달이 열려있고, 영상포함 유형일 때만 fetch)
  const {
    data: videosData,
    isLoading: isLoadingVideos,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useShareableVideos(projectId, {
    enabled: isOpen && shareType === 'slide_script_video',
  });

  // 공유 링크 생성 mutation
  const createShareLinkMutation = useCreateShareLink();

  // 영상 목록 (모든 페이지의 videos를 flat하게 병합)
  const videos = useMemo(() => {
    if (!videosData?.pages) return [];
    return videosData.pages.flatMap(
      (page) => (page.resultType === 'SUCCESS' && page.success?.videos) || [],
    );
  }, [videosData]);

  // 선택된 비디오 바뀔 때만 다시 계산
  const selectedVideo = useMemo(() => {
    return videos.find((v) => v.id === selectedVideoId) ?? null;
  }, [videos, selectedVideoId]);

  // 무한 스크롤을 위한 Intersection Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  // 사용자 클립보드에 url 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast.success('복사가 완료되었습니다.');
    } catch {
      showToast.error('복사에 실패했습니다.');
    }
  };

  const handleGenerate = async () => {
    // 프로젝트 id없으면 생성x
    if (!projectId) return;
    // 영상포함 유형일때 비디오 없으면 공유 링크 생성X
    if (shareType === 'slide_script_video' && !selectedVideoId) return;

    try {
      // API scope 값 변환 (slide_script -> slides_script)
      const scope = shareType === 'slide_script' ? 'slides_script' : 'slides_script_video';

      const response = await createShareLinkMutation.mutateAsync({
        projectId,
        data: {
          scope,
          videoId: shareType === 'slide_script_video' ? (selectedVideoId ?? undefined) : undefined,
        },
      });

      if (response.resultType === 'SUCCESS' && response.success) {
        setShareUrl(response.success.shareUrl);
        setStep('result');
      } else if (response.resultType === 'FAILURE') {
        // 서버에서 에러 응답이 온 경우
        const errorMessage = response.error.reason || '공유 링크 생성에 실패했습니다.';
        showToast.error(errorMessage);
      } else {
        // 예상치 못한 응답 형식
        showToast.error('알 수 없는 응답 형식입니다.');
      }
    } catch {
      showToast.error('공유 링크 생성에 실패했습니다.');
    }
  };
  const shareTypeItems: DropdownItem[] = [
    {
      id: 'slide_script',
      label: '슬라이드 + 대본',
      onClick: () => setShareType('slide_script'),
      selected: shareType === 'slide_script',
    },
    {
      id: 'slide_script_video',
      label: '슬라이드 + 대본 + 영상',
      onClick: () => setShareType('slide_script_video'),
      selected: shareType === 'slide_script_video',
    },
  ];

  const typeSelect = (
    <div className="flex flex-col gap-2">
      <label className="text-body-m-bold text-gray-600">공유 유형</label>
      <Dropdown
        trigger={({ isOpen }) => (
          <button
            type="button"
            className={clsx(
              'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3',
              'cursor-pointer',
              isOpen && 'border-gray-400',
            )}
          >
            <span className="text-body-m-bold text-gray-800">
              {shareType === 'slide_script' ? '슬라이드 + 대본' : '슬라이드 + 대본 + 영상'}
            </span>
            <svg
              className={clsx('h-4 w-4 text-gray-600 transition-transform', isOpen && 'rotate-180')}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        items={shareTypeItems}
        position="bottom"
        align="start"
        className="w-full"
        menuClassName="w-full"
        ariaLabel="공유 유형 선택"
      />
      <p className="text-caption text-gray-600">
        {shareType === 'slide_script'
          ? '슬라이드와 대본만 공유됩니다.'
          : '녹화된 영상과 함께 공유됩니다.'}
      </p>
    </div>
  );
  const videoList = (
    <div className="flex flex-col gap-2">
      <label className="text-body-m-bold text-gray-600">공유할 녹화 영상</label>
      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
        {isLoadingVideos ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-m text-gray-600">영상 목록을 불러오는 중...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-m text-gray-600">공유 가능한 영상이 없습니다.</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {videos.map((v) => {
              const active = v.id === selectedVideoId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVideoId(v.id)}
                  className={clsx(
                    'flex w-full items-center gap-6 px-5 py-4 text-left transition-colors',
                    active ? 'bg-main-variant1' : 'bg-white hover:bg-gray-100',
                  )}
                >
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="h-16.75 w-30 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="h-16.75 w-30 rounded-sm bg-gray-200" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span
                      className={clsx('text-body-m-bold', active ? 'text-white' : 'text-gray-800')}
                    >
                      {v.title}
                    </span>
                    <span
                      className={clsx('text-caption', active ? 'text-white/80' : 'text-gray-600')}
                    >
                      {formatTimestamp(v.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
            {/* 무한 스크롤 observer target */}
            <div ref={observerTarget} className="h-4 w-full" />
            {/* 다음 페이지 로딩 중 */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <span className="text-body-s text-gray-600">추가 영상을 불러오는 중...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  // form 단계와 result 단계 나눠서 렌더링
  const modalBody =
    step === 'form' ? (
      <div className="relative flex flex-col gap-3">
        {typeSelect}
        {shareType === 'slide_script_video' && videoList}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            (shareType === 'slide_script_video' && !selectedVideoId) ||
            createShareLinkMutation.isPending
          }
          className={clsx(
            'mt-4 h-14 w-full rounded-lg text-body-m-bold text-white transition flex items-center justify-center gap-2',
            (shareType === 'slide_script_video' && !selectedVideoId) ||
              createShareLinkMutation.isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-main hover:opacity-90',
          )}
        >
          <span className="flex items-center gap-2">
            {createShareLinkMutation.isPending ? '생성 중...' : '공유 링크 생성'}
            {!createShareLinkMutation.isPending && <IconLink />}
          </span>
        </button>
      </div>
    ) : (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-body-m-bold text-gray-600">공유 링크</label>
          <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white pl-5 pr-2">
            <input
              value={shareUrl}
              readOnly
              className="w-full bg-transparent text-body-m text-gray-800 outline-none"
            />
            <div className="relative">
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 text-gray-800 hover:opacity-80"
                aria-label="링크 복사"
              >
                <IconCopy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {/* SNS 공유 */}
        <div className="flex flex-col gap-2">
          <label className="text-body-m-bold text-gray-600">SNS로 공유하기</label>
          <div className="flex items-center justify-center gap-4">
            {/* 카카오톡 */}
            <button
              type="button"
              aria-label="카카오톡으로 공유"
              onClick={() => {
                if (!KAKAO_JS_KEY) {
                  showToast.error('카카오 JS 키가 설정되지 않았습니다.', '.env를 확인해주세요.');
                  return;
                }
                shareToKakao({
                  jsKey: KAKAO_JS_KEY,
                  url: shareUrl,
                  text: SHARE_TEXT,
                  title: '발표 자료 공유',
                });
              }}
              className="flex h-35 w-34 flex-col items-center justify-center gap-2 rounded-lg bg-white transition-colors hover:bg-gray-100"
            >
              <img src={kakaoTalkIcon} alt="" aria-hidden className="h-16 w-16" />
              <span className="text-body-m-bold text-gray-800">카카오톡</span>
            </button>
            {/* 인스타그램 */}
            <button
              type="button"
              aria-label="인스타그램으로 공유"
              onClick={shareToInstagram}
              className="flex h-35 w-34 flex-col items-center justify-center gap-2 rounded-lg bg-white transition-colors hover:bg-gray-100"
            >
              <img src={instagramIcon} alt="" aria-hidden className="h-15 w-15" />
              <span className="text-body-m-bold text-gray-800">인스타그램</span>
            </button>
            {/* X */}
            <button
              type="button"
              aria-label="X로 공유"
              onClick={() =>
                shareToX({
                  url: shareUrl,
                  text: SHARE_TEXT,
                })
              }
              className="flex h-35 w-34 flex-col items-center justify-center gap-2 rounded-lg bg-white transition-colors hover:bg-gray-100"
            >
              <img src={xIcon} alt="" aria-hidden className="h-16 w-16" />
              <span className="text-body-m-bold text-gray-800">X</span>
            </button>
            {/* 페이스북 */}
            <button
              type="button"
              aria-label="페이스북으로 공유"
              onClick={() =>
                shareToFacebook({
                  url: shareUrl,
                })
              }
              className="flex h-35 w-34 flex-col items-center justify-center gap-2 rounded-lg bg-white transition-colors hover:bg-gray-100"
            >
              <img src={facebookIcon} alt="" aria-hidden className="h-16 w-16" />
              <span className="text-body-m-bold text-gray-800">페이스북</span>
            </button>
          </div>
        </div>

        {/* 공유유형, 선택된 영상 정보 */}
        <div className="rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-30 shrink-0 text-body-m-bold text-gray-600">공유 유형</span>
              <span className="text-body-m-bold text-gray-800">{shareTypeLabel(shareType)}</span>
            </div>
            {shareType === 'slide_script_video' && selectedVideo && (
              <div className="flex items-center">
                <span className="w-30 shrink-0 text-body-m-bold text-gray-600">선택된 영상</span>
                <div className="flex items-end gap-2">
                  <span className="text-body-m-bold text-gray-800">{selectedVideo.title}</span>
                  <span className="text-caption text-gray-600">
                    {formatTimestamp(selectedVideo.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="h-14 w-full rounded-lg bg-gray-100 text-body-m-bold text-main"
        >
          닫기
        </button>
      </div>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      onAfterClose={resetForm}
      title="발표 자료 공유"
      className="w-148.5 max-w-[calc(100vw-32px)]"
    >
      {modalBody}
    </Modal>
  );
}
