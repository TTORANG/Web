// src/components/share/share-modal/ShareModal.tsx
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';

import { type ShareType, useShareStore } from '@/stores/shareStore';

/**
 * 시안에 있는 "공유할 녹화 영상" 리스트를 위해
 * 임시 데이터 사용
 *
 */
type VideoItem = { id: string; title: string; date: string };

const MOCK_VIDEOS: VideoItem[] = [
  { id: 'v1', title: '새로운 연습 1', date: '2024-11-15 14:30' },
  { id: 'v2', title: '새로운 연습 2', date: '2024-11-15 11:20' },
  { id: 'v3', title: '새로운 연습 3', date: '2024-11-14 16:45' },
  { id: 'v4', title: '새로운 연습 4', date: '2024-11-14 10:15' },
];

function shareTypeLabel(type: ShareType) {
  return type === 'slide_script' ? '슬라이드 + 대본' : '슬라이드 + 대본 + 영상';
}

/**
 * ShareModal은 Layout에 "항상 깔아두되",
 * store의 isShareModalOpen 값이 false면 null을 반환해서
 * 화면에 아무것도 렌더되지 않게 만든다.
 *
 * LoginModal과 동일한 패턴.
 */
export function ShareModal() {
  const { projectId } = useParams<{ projectId: string }>();

  // shareModal이 store에 정의된 값, 함수들을 구독하고 있다.
  const isOpen = useShareStore((s) => s.isShareModalOpen);
  const step = useShareStore((s) => s.step);
  const shareType = useShareStore((s) => s.shareType);
  const selectedVideoId = useShareStore((s) => s.selectedVideoId);
  const shareUrl = useShareStore((s) => s.shareUrl);

  const close = useShareStore((s) => s.closeShareModal);
  const setShareType = useShareStore((s) => s.setShareType);
  const setSelectedVideoId = useShareStore((s) => s.setSelectedVideoId);
  const generateShareLink = useShareStore((s) => s.generateShareLink);
  const resetForm = useShareStore((s) => s.resetForm);

  // "복사 완료" 같은 UX를 위해 간단한 로컬 상태를 둔다.
  const [copied, setCopied] = useState(false);

  // 선택된 영상 정보(결과 화면에서 표시용)
  const selectedVideo = useMemo(() => {
    return MOCK_VIDEOS.find((v) => v.id === selectedVideoId) ?? null;
  }, [selectedVideoId]);

  useEffect(() => {
    if (!isOpen) return;

    // Esc로 닫기 (LoginModal과 동일)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    // 모달 열리면 바디 스크롤 잠금 (LoginModal과 동일)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  // 닫혀 있으면 아무것도 렌더링 안 함 (LoginModal과 동일)
  if (!isOpen) return null;

  /**
   * 링크 복사
   * - 실제로는 sonner(Toaster)로 "복사 완료" 토스트 띄우는 것도 추천
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard 권한 이슈 등 예외 처리
      setCopied(false);
    }
  };

  /**
   * "공유 링크 생성" 클릭
   * - projectId가 URL에 있어야 정상 생성 가능 (너희 라우팅 구조상 /:projectId 아래에서만 Gnb가 보임)
   */
  const handleGenerate = () => {
    if (!projectId) return;

    // 영상 포함 공유라면 영상 선택이 필수라고 가정
    if (shareType === 'slide_script_video' && !selectedVideoId) return;

    generateShareLink({
      projectId,
      shareType,
      selectedVideoId,
    });
  };

  /**
   * 결과 화면에서 "닫기"를 누르면:
   * - 모달 닫고
   * - 다음에 열 때 기본 form으로 시작하도록 reset
   */
  const handleCloseFromResult = () => {
    close();
    resetForm();
  };

  // 시안 느낌의 "드롭다운"을 간단히 select로 구현
  const typeSelect = (
    <div className="flex flex-col gap-1">
      <label className="text-caption text-gray-500">공유 유형</label>
      <select
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-body-s"
        value={shareType}
        onChange={(e) => setShareType(e.target.value as ShareType)}
      >
        <option value="slide_script">슬라이드 + 대본</option>
        <option value="slide_script_video">슬라이드 + 대본 + 영상</option>
      </select>
      <p className="text-caption text-gray-400">공유 범위를 설정해보세요.</p>
    </div>
  );

  // 시안의 “공유할 녹화 영상” 영역: 고정 높이 + 내부 스크롤
  const videoList = (
    <div className="flex flex-col gap-2">
      <label className="text-caption text-gray-500">공유할 녹화 영상</label>

      <div className="max-h-[260px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
        <div className="flex flex-col gap-2">
          {MOCK_VIDEOS.map((v) => {
            const active = v.id === selectedVideoId;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVideoId(v.id)}
                className={[
                  'flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition',
                  active
                    ? 'border-main bg-white'
                    : 'border-transparent bg-white hover:border-gray-200',
                ].join(' ')}
              >
                <div className="flex flex-col">
                  <span className="text-body-s-bold text-gray-800">{v.title}</span>
                  <span className="text-caption text-gray-500">{v.date}</span>
                </div>

                {active && <span className="text-caption text-main">선택됨</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /**
   * 모달 바디: step에 따라 2가지 화면을 렌더링
   * - form: 옵션 선택 + 영상 리스트(조건부) + "공유 링크 생성"
   * - result: 링크 + SNS 버튼 + 공유 정보 + 닫기
   */
  const modalBody =
    step === 'form' ? (
      <div className="flex flex-col gap-4">
        {typeSelect}

        {/* 공유 유형이 "영상 포함"일 때만 영상 리스트가 펼쳐짐 (시안 2번째 이미지) */}
        {shareType === 'slide_script_video' && videoList}

        {/* 하단 버튼 (시안의 파란 큰 버튼) */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={shareType === 'slide_script_video' && !selectedVideoId}
          className={[
            'mt-2 h-12 w-full rounded-xl text-body-s-bold text-white transition',
            shareType === 'slide_script_video' && !selectedVideoId
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-main hover:opacity-90',
          ].join(' ')}
        >
          공유 링크 생성
        </button>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {/* 링크 영역 */}
        <div className="flex flex-col gap-1">
          <label className="text-caption text-gray-500">공유 링크</label>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <input
              value={shareUrl}
              readOnly
              className="w-full bg-transparent text-body-s text-gray-800 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="text-caption text-main hover:opacity-80"
            >
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
        </div>

        {/* SNS 공유 (시안의 아이콘 4개) - 실제 연동 전이므로 버튼만 형태 제공 */}
        <div className="flex flex-col gap-2">
          <label className="text-caption text-gray-500">SNS로 공유하기</label>
          <div className="flex items-center gap-4">
            <button type="button" className="h-10 w-10 rounded-full bg-gray-100">
              카
            </button>
            <button type="button" className="h-10 w-10 rounded-full bg-gray-100">
              인
            </button>
            <button type="button" className="h-10 w-10 rounded-full bg-gray-100">
              X
            </button>
            <button type="button" className="h-10 w-10 rounded-full bg-gray-100">
              f
            </button>
          </div>
        </div>

        {/* 결과 요약 정보 */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-caption text-gray-500">공유 유형</div>
          <div className="text-body-s-bold text-gray-800">{shareTypeLabel(shareType)}</div>

          {shareType === 'slide_script_video' && selectedVideo && (
            <div className="mt-2">
              <div className="text-caption text-gray-500">선택된 영상</div>
              <div className="text-body-s text-gray-700">
                {selectedVideo.title} · {selectedVideo.date}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCloseFromResult}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white text-body-s-bold text-gray-800 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    );

  /**
   * Portal로 document.body에 붙이기
   * - Layout이 overflow-hidden이라도 모달이 잘 보이게
   * - z-index 충돌 최소화
   * - LoginModal과 완전히 같은 방식
   */
  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이: 클릭하면 닫힘 (LoginModal과 동일) */}
      <button
        type="button"
        aria-label="close overlay"
        className="absolute inset-0 cursor-default bg-black/60"
        onClick={close}
      />

      {/* 다이얼로그 카드 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="발표 자료 공유"
        className="relative z-10 w-[520px] max-w-[calc(100vw-32px)] rounded-2xl bg-white px-6 py-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-body-m-bold text-gray-800">발표 자료 공유</div>

          {/* 닫기 버튼: 아이콘 대신 X 텍스트로 처리(필요하면 CloseIcon 연결) */}
          <button
            type="button"
            onClick={close}
            aria-label="close"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        {modalBody}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
