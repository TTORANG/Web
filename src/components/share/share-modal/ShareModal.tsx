import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';
import { toast } from 'sonner';

import IconCopy from '@/assets/icons/icon-copy.svg?react';
import facebookIcon from '@/assets/sns-icons/facebook-icon@4x.webp';
import instagramIcon from '@/assets/sns-icons/instagram-icon@4x.webp';
import kakaoTalkIcon from '@/assets/sns-icons/kakaotalk-icon@4x.webp';
import xIcon from '@/assets/sns-icons/x-icon@4x.webp';
import { Popover } from '@/components/common/Popover';
import { type ShareType, useShareStore } from '@/stores/shareStore';
// sns공유테스트
import { shareToFacebook, shareToInstagram, shareToKakao, shareToX } from '@/utils/snsShare';

const KAKAO_JS_KEY = import.meta.env?.VITE_KAKAO_JS_KEY ?? '';
const SHARE_TEXT = '내 발표를 확인하고 피드백을 남겨주세요!';

// 임시데이터 설정
type VideoItem = { id: string; title: string; date: string };
const MOCK_VIDEOS: VideoItem[] = [
  { id: 'v1', title: '새로운 연습 1', date: '2024-11-15 14:30' },
  { id: 'v2', title: '새로운 연습 2', date: '2024-11-15 11:20' },
  { id: 'v3', title: '새로운 연습 3', date: '2024-11-14 16:45' },
  { id: 'v4', title: '새로운 연습 4', date: '2024-11-14 10:15' },
];

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
  const generateShareLink = useShareStore((s) => s.generateShareLink);
  const resetForm = useShareStore((s) => s.resetForm);

  // 복사완료 토스트 알림용
  const [copied, setCopied] = useState(false);

  // (남아있지만 현재 로직에서 실사용 안 하면 추후 제거 가능)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownButtonRef = useRef<HTMLDivElement | null>(null);

  // 공유유형 Popover open 상태 (controlled로 사용)
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const onMousedown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMousedown);
    return () => document.removeEventListener('mousedown', onMousedown);
  }, [isDropdownOpen]);

  // 선택된 비디오 바뀔 때만 다시 계산
  const selectedVideo = useMemo(() => {
    return MOCK_VIDEOS.find((v) => v.id === selectedVideoId) ?? null;
  }, [selectedVideoId]);

  // 모달 열려있을 때
  useEffect(() => {
    if (!isOpen) return;

    // esc 눌렀을때,
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      // 1순위: 팝오버 열려있고, 공유유형 popover 먼저 닫기
      if (isTypeOpen) {
        setIsTypeOpen(false);
        return;
      }

      // 2순위: 다른 드롭다운 닫기(있다면)
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
        return;
      }

      // 3순위: 모달 닫기
      close();
    };

    // 모달 열릴때 배경 스크롤 막기
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 모달 닫히면 원복
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, isTypeOpen, isDropdownOpen]);

  if (!isOpen) return null;

  // 사용자 클립보드에 url 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleGenerate = () => {
    // 프로젝트 id없으면 생성x
    if (!projectId) return;
    // 영상포함 유형일때 비디오 없으면 공유 링크 생성X
    if (shareType === 'slide_script_video' && !selectedVideoId) return;

    generateShareLink({
      projectId,
      shareType,
      selectedVideoId,
    });
  };

  const handleCloseFromResult = () => {
    close();
    resetForm();
  };

  // Popover children을 함수로 쓰지 않고, 상태로 닫도록 변경
  const typeSelect = (
    <div className={clsx('flex flex-col', isTypeOpen ? 'gap-1' : 'gap-2')}>
      <label className="text-caption text-gray-600">공유 유형</label>

      <Popover
        position="bottom"
        align="start"
        isOpen={isTypeOpen} // controlled
        onOpenChange={setIsTypeOpen} // open 상태 동기화
        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.10)]"
        ariaLabel="공유 유형 선택"
        trigger={({ isOpen }) => (
          <button
            type="button"
            className={clsx(
              'flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3',
              'cursor-pointer',
              isOpen && 'border-gray-300',
            )}
          >
            <span className="text-body-s-bold text-gray-800">
              {shareType === 'slide_script' ? '슬라이드 + 대본' : '슬라이드 + 대본 + 영상'}
            </span>

            <svg
              className={clsx('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')}
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
      >
        {/* 변경: children 함수 호출 X, 일반 JSX만 렌더 */}
        <div className="w-full bg-white">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 클릭이 trigger로 다시 전달돼 “바로 다시 열리는 현상”을 방지
              setShareType('slide_script');
              setIsTypeOpen(false); // 변경: close() 대신 상태로 닫기
            }}
            className={clsx(
              'w-full px-5 py-3 text-left transition-colors',
              'hover:bg-gray-50',
              shareType === 'slide_script' ? 'bg-gray-100' : 'bg-white',
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={clsx('text-body-s', shareType === 'slide_script' && 'font-semibold')}
              >
                슬라이드 + 대본
              </span>
              {shareType === 'slide_script' && (
                <span className="text-caption text-gray-700">✓</span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShareType('slide_script_video');
              setIsTypeOpen(false); // 변경
            }}
            className={clsx(
              'w-full px-5 py-3 text-left transition-colors border-t border-gray-100',
              'hover:bg-gray-50',
              shareType === 'slide_script_video' ? 'bg-gray-100' : 'bg-white',
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  'text-body-s',
                  shareType === 'slide_script_video' && 'font-semibold',
                )}
              >
                슬라이드 + 대본 + 영상
              </span>
              {shareType === 'slide_script_video' && (
                <span className="text-caption text-gray-700">✓</span>
              )}
            </div>
          </button>
        </div>
      </Popover>

      {!isTypeOpen && (
        <p className="text-caption text-gray-600">
          {shareType === 'slide_script'
            ? '슬라이드와 대본만 공유됩니다.'
            : '녹화된 영상과 함께 공유됩니다.'}
        </p>
      )}
    </div>
  );

  const videoList = (
    <div className="flex flex-col gap-2">
      <label className="text-caption text-gray-500">공유할 녹화 영상</label>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
        <div className="flex flex-col">
          {MOCK_VIDEOS.map((v) => {
            const active = v.id === selectedVideoId;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVideoId(v.id)}
                className={[
                  'flex w-full items-center gap-6 px-5 py-4 text-left transition',
                  active ? 'bg-gray-100' : 'bg-white hover:bg-gray-50',
                ].join(' ')}
              >
                <div className="h-16.75 w-30 rounded-sm bg-gray-200" />

                <div className="flex flex-col">
                  <span className="text-body-s-bold text-gray-800">{v.title}</span>
                  <span className="text-caption text-gray-600">{v.date}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const modalBody =
    step === 'form' ? (
      <div className="relative flex flex-col gap-3">
        {typeSelect}
        {shareType === 'slide_script_video' && videoList}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={shareType === 'slide_script_video' && !selectedVideoId}
          className={[
            'mt-4 h-14 w-full rounded-[8px] text-body-s-bold text-white transition flex items-center justify-center gap-2',
            shareType === 'slide_script_video' && !selectedVideoId
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-main hover:opacity-90',
          ].join(' ')}
        >
          <span>공유 링크 생성</span>
        </button>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-caption text-gray-500">공유 링크</label>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <input
              value={shareUrl}
              readOnly
              className="w-full bg-transparent text-body-s text-gray-800 outline-none"
            />

            <div className="relative">
              <button
                type="button"
                onClick={handleCopy}
                className="text-caption text-main hover:opacity-80"
                aria-label="링크 복사"
              >
                <IconCopy className="h-4 w-4" />
              </button>

              {copied && (
                <div
                  role="status"
                  className={clsx(
                    'absolute -top-11 right-0',
                    'rounded-md bg-gray-900 px-3 py-2 text-caption text-white shadow-lg',
                    'whitespace-nowrap',
                  )}
                >
                  URL을 복사했습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SNS 공유 , 링크 생성 */}
        <div className="flex flex-col gap-5">
          <label className="text-caption text-gray-500">SNS로 공유하기</label>

          <div className="flex items-center justify-center gap-17">
            {/* 카카오톡 */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                aria-label="카카오톡으로 공유"
                onClick={() => {
                  if (!KAKAO_JS_KEY) {
                    toast.error('카카오 JS 키가 설정되지 않았습니다. (.env 확인)');
                    return;
                  }
                  shareToKakao({
                    jsKey: KAKAO_JS_KEY,
                    url: shareUrl,
                    text: SHARE_TEXT,
                    title: '발표 자료 공유',
                  });
                }}
                className="h-15 w-15 rounded-full grid place-items-center"
              >
                <img src={kakaoTalkIcon} alt="" aria-hidden className="h-12 w-12" />
              </button>
              <span className="mt-2 text-caption text-black">카카오톡</span>
            </div>

            {/* 인스타그램 */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                aria-label="인스타로 공유"
                onClick={shareToInstagram}
                className="h-15 w-15 rounded-full grid place-items-center"
              >
                <img src={instagramIcon} alt="" aria-hidden className="h-12 w-12" />
              </button>
              <span className="mt-2 text-caption text-black">인스타그램</span>
            </div>

            {/* X */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                aria-label="X으로 공유"
                onClick={() =>
                  shareToX({
                    url: shareUrl,
                    text: SHARE_TEXT,
                  })
                }
                className="h-15 w-15 rounded-full grid place-items-center"
              >
                <img src={xIcon} alt="" aria-hidden className="h-12 w-12" />
              </button>
              <span className="mt-2 text-caption text-black">X</span>
            </div>

            {/* 페이스북 */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                aria-label="페이스북으로 공유"
                onClick={() =>
                  shareToFacebook({
                    url: shareUrl,
                  })
                }
                className="h-15 w-15 rounded-full grid place-items-center"
              >
                <img src={facebookIcon} alt="" aria-hidden className="h-12 w-12" />
              </button>
              <span className="mt-2 text-caption text-black">페이스북</span>
            </div>
          </div>
        </div>

        {/* 공유유형, 선택된 영상 정보 */}
        <div className="rounded-xl border border-gray-200 bg-gray-0 p-3 mt-6">
          <div className="grid grid-cols-[92px_1fr] items-center gap-y-2">
            <div className="text-caption text-gray-500">공유 유형</div>
            <div className="text-body-s-bold text-gray-800">{shareTypeLabel(shareType)}</div>

            {shareType === 'slide_script_video' && selectedVideo && (
              <>
                <div className="text-caption text-gray-500">선택된 영상</div>

                <div className="flex gap-5">
                  <span className="text-body-s text-gray-700 ">{selectedVideo.title}</span>
                  <span className="text-sm text-body-s text-gray-400">{selectedVideo.date}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCloseFromResult}
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100 text-body-s-bold text-blue-700"
        >
          닫기
        </button>
      </div>
    );

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="close overlay"
        className="absolute inset-0 cursor-default bg-black/60"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="발표 자료 공유"
        className="relative z-12 w-148.5 max-w-[calc(100vw-32px)] rounded-xl bg-white px-6 pt-5 pb-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-body-m-bold text-gray-800">발표 자료 공유</div>

          <button
            type="button"
            onClick={close}
            aria-label="close"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {modalBody}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
