import React from 'react';

import smallArrowIcon from '../../assets/icons/smallArrowIcon.svg';

type SlideTitleProps = {
  // 변수명 그대로 유지: slideNameChange
  slideNameChange: {
    value: boolean;
    toggle: () => void;
    off: () => void;
  };

  // 변수명 그대로 유지: slideTitle / setSlideTitle
  slideTitle: string;
  setSlideTitle: React.Dispatch<React.SetStateAction<string>>;
};

const SlideTitle = ({ slideNameChange, slideTitle, setSlideTitle }: SlideTitleProps) => {
  return (
    <div className="relative inline-block">
      {/* (기존 그대로) 슬라이드 제목 버튼 */}
      <button
        type="button"
        onClick={slideNameChange.toggle}
        className="
          h-7 px-2 rounded-md
          inline-flex items-center gap-1.5
          text-zinc-700 text-sm font-semibold
          hover:bg-zinc-50
        "
      >
        <span className="max-w-[120px] line-clamp-1">{slideTitle}</span>
        <img src={smallArrowIcon} />
      </button>

      {/* (기존 그대로) 슬라이드 이름변경 popover */}
      {slideNameChange.value && (
        <>
          {/* 바깥 클릭 시 닫기 */}
          <div className="fixed inset-0 z-40" onClick={slideNameChange.off} />

          <div
            className="
              absolute z-50 left-0 top-full mt-2
              w-[320px]
              rounded-lg bg-white
              border border-zinc-200
              shadow-[0px_4px_20px_rgba(0,0,0,0.08)]
              px-3 py-2
              flex items-center gap-2
            "
          >
            {/* 슬라이드 제목 변경 입력창 */}
            <input
              value={slideTitle}
              onChange={(e) => setSlideTitle(e.target.value)}
              className="
                flex-1 h-9 px-3
                rounded-md
                border border-zinc-200
                text-sm text-zinc-700
                outline-none
                focus:border-indigo-500
              "
            />

            {/* 저장 버튼: 핸들러만 연결(현재는 아무 동작 X) */}
            <button
              type="button"
              //  onClick={handleSaveSlideTitle}
              className="
                h-9 px-3 rounded-full
                bg-indigo-500 text-white
                text-sm font-semibold
                hover:bg-indigo-600
              "
            >
              저장
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SlideTitle;
