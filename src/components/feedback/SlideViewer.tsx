/**
 * @file SlideViewer.tsx
 * @description 피드백 화면 좌측 슬라이드 뷰어
 */
import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';
import type { Slide } from '@/types/slide';

interface SlideViewerProps {
  // 1. 핵심 데이터
  slide: Slide | undefined;
  slideIndex: number;
  totalSlides: number;

  // 2. 네비게이션
  isFirst: boolean;
  isLast: boolean;
  goPrev: () => void;
  goNext: () => void;

  // 3. 제목 수정 관련
  isEditingTitle: boolean;
  draftTitle: string;
  setDraftTitle: (value: string) => void;
  startTitleEdit: () => void;
  commitTitle: () => void;
  cancelTitleEdit: () => void;

  // 4. 뷰 모드
  viewMode?: 'desktop' | 'mobile-screen' | 'mobile-script';
}

export default function SlideViewer({
  slide,
  slideIndex,
  totalSlides,
  isFirst,
  isLast,
  isEditingTitle,
  draftTitle,
  setDraftTitle,
  goPrev,
  goNext,
  startTitleEdit,
  commitTitle,
  cancelTitleEdit,
  viewMode = 'desktop', // 기본값
}: SlideViewerProps) {
  const showScreen = viewMode === 'desktop' || viewMode === 'mobile-screen';
  const showScript = viewMode === 'desktop' || viewMode === 'mobile-script';
  // 모바일 스크립트 뷰에서는 버튼을 숨긴다
  const showButtons = viewMode === 'desktop';

  // slide가 없을 때 안전 장치
  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <p className="text-gray-500">슬라이드 로딩 중...</p>
      </div>
    );
  }

  return (
    <div
      className={`${viewMode === 'desktop' ? 'ml-35' : ''} flex-1 flex flex-col min-w-0 bg-gray-900`}
    >
      {/* 1. 상단 영역 (화면) */}
      {showScreen && (
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          <div className="aspect-[16/9] w-full max-h-full bg-gray-600 relative flex items-center justify-center shadow-lg">
            {/* 이미지가 있으면 이미지, 없으면 제목 텍스트 */}
            {slide.thumb ? (
              <img src={slide.thumb} alt={slide.title} className="w-full h-full object-cover" />
            ) : (
              <p className="text-gray-300 text-lg font-medium">{slide.title}</p>
            )}
          </div>
        </div>
      )}

      {/* 2. 좌측 하단: 설명 텍스트 */}
      {showScript && (
        <div
          className={`${viewMode === 'desktop' ? 'h-[250px] mt-2' : 'flex-1'} bg-gray-900 px-5 overflow-y-auto`}
        >
          <div
            className={`${viewMode === 'desktop' ? 'flex justify-between items-baseline mb-3' : 'mt-2'}`}
          >
            {isEditingTitle ? (
              <input
                value={draftTitle}
                autoFocus
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') cancelTitleEdit();
                }}
                className="text-body-m-bold text-white bg-transparent border-b border-gray-500 rounded-none px-1 focus:outline-none focus:border-white"
              />
            ) : (
              <h2
                className="text-body-m-bold text-white cursor-pointer hover:underline decoration-gray-500 underline-offset-4"
                onDoubleClick={startTitleEdit}
                title="더블클릭해서 제목 수정"
              >
                {slide.title}
              </h2>
            )}

            {/* 데스크탑 모드에서만 네비게이션 버튼 표시 */}
            {showButtons && (
              <div className="bottom-6 inline-flex items-center gap-1 rounded-full py-2 backdrop-blur">
                <button
                  onClick={goPrev}
                  disabled={isFirst}
                  className={[
                    'grid h-6 w-6 place-items-center rounded-full ',
                    isFirst
                      ? 'bg-gray-800 opacity-30 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 active:scale-95 transition',
                  ].join(' ')}
                >
                  <LeftArrow className="text-white" />
                </button>

                <div className="min-w-[56px] text-center text-body-m-bold text-gray-200">
                  {slideIndex + 1} / {totalSlides}
                </div>

                <button
                  onClick={goNext}
                  disabled={isLast}
                  className={[
                    'grid h-6 w-6 place-items-center rounded-full',
                    isLast
                      ? 'bg-gray-800 opacity-30 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 active:scale-95 transition',
                  ].join(' ')}
                >
                  <RightArrow className="text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-3 my-2 ">
            <p className="text-body-s text-white" style={{ whiteSpace: 'pre-line' }}>
              {slide.script}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
