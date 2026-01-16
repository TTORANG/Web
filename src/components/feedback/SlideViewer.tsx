// 좌측 슬라이드 뷰어
// components/feedback/SlideViewer.tsx
import LeftArrow from '@/assets/icons/icon-arrow-left.svg?react';
import RightArrow from '@/assets/icons/icon-arrow-right.svg?react';

import { useSlides } from '../../hooks/useSlides';

// viewMode 추가: 'desktop'(기존), 'mobile-screen'(화면만), 'mobile-script'(대본만)
interface Props extends ReturnType<typeof useSlides> {
  viewMode?: 'desktop' | 'mobile-screen' | 'mobile-script';
}

export default function SlideViewer({
  currentSlide,
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
}: Props) {
  const showScreen = viewMode === 'desktop' || viewMode === 'mobile-screen';
  const showScript = viewMode === 'desktop' || viewMode === 'mobile-script';

  // 모바일 스크립트 뷰에서는 버튼을 숨긴다
  const showButtons = viewMode === 'desktop';
  return (
    <div
      className={`${viewMode === 'desktop' ? 'ml-35' : ''} flex-1 flex flex-col min-w-0 bg-gray-900`}
    >
      {/* 1. 좌측 상단: 슬라이드 뷰어 */}
      {/* 1. 상단 영역 (슬라이드가 들어갈 공간 확보) */}
      {/* 이 div는 남는 공간을 꽉 채우고, 내용물을 정중앙에 배치합니다. */}
      {showScreen && (
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          {/* 2. 슬라이드 본체 (회색 박스) */}
          {/* w-full max-h-full: 가로를 꽉 채우되, 세로 공간이 모자라면 높이에 맞춤 (반응형) */}
          <div className="aspect-[16/9] w-full max-h-full bg-gray-600 relative flex items-center justify-center shadow-lg">
            <p className="text-gray-300 text-lg font-medium">{currentSlide.viewerText}</p>
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
                className="text-body-m-bold text-white bg-gray-800 border-white rounded px-1"
              />
            ) : (
              <h2
                className="text-body-m-bold text-white"
                onDoubleClick={startTitleEdit}
                title="더블클릭해서 제목 수정"
              >
                {currentSlide.title}
              </h2>
            )}
            {/* 데스크탑 모드에서만 내부 버튼 표시 */}
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
              {currentSlide.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
