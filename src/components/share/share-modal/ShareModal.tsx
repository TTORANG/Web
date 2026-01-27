import { useMemo, useState } from 'react';
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
import { type ShareType, useShareStore } from '@/stores/shareStore';
// sns공유테스트
import { shareToFacebook, shareToInstagram, shareToKakao, shareToX } from '@/utils/snsShare';
import { showToast } from '@/utils/toast';

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

  // 선택된 비디오 바뀔 때만 다시 계산
  const selectedVideo = useMemo(() => {
    return MOCK_VIDEOS.find((v) => v.id === selectedVideoId) ?? null;
  }, [selectedVideoId]);

  // 사용자 클립보드에 url 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      showToast.error('복사에 실패했습니다.');
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
  const handleClose = () => {
    close();
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
        <div className="flex flex-col">
          {MOCK_VIDEOS.map((v) => {
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
                <div className="h-16.75 w-30 rounded-sm bg-gray-200" />
                <div className="flex flex-col gap-1">
                  <span
                    className={clsx('text-body-m-bold', active ? 'text-white' : 'text-gray-800')}
                  >
                    {v.title}
                  </span>
                  <span
                    className={clsx('text-caption', active ? 'text-white/80' : 'text-gray-600')}
                  >
                    {v.date}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
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
          disabled={shareType === 'slide_script_video' && !selectedVideoId}
          className={clsx(
            'mt-4 h-14 w-full rounded-lg text-body-m-bold text-white transition flex items-center justify-center gap-2',
            shareType === 'slide_script_video' && !selectedVideoId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-main hover:opacity-90',
          )}
        >
          <span className="flex items-center gap-2">
            공유 링크 생성
            <IconLink />
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
                  <span className="text-caption text-gray-600">{selectedVideo.date}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="h-14 w-full rounded-lg bg-gray-100 text-body-m-bold text-main"
        >
          닫기
        </button>
      </div>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onAfterClose={resetForm}
      title="발표 자료 공유"
      className="w-148.5 max-w-[calc(100vw-32px)]"
    >
      {modalBody}
    </Modal>
  );
}
