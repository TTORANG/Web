import { useState } from 'react';

import { useToggle } from '../../hooks/useToggle';
import smallArrowIcon from '../assets/icons/smallArrowIcon.svg';
import Opinion from './Opinion';
import ScriptBoxEmogi from './ScriptBoxEmogi';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

const ScriptBox = () => {
  // 0. 슬라이드 이름(이름 변경) 버튼
  const slideNameChange = useToggle(false);
  // 0-1. 현재 슬라이드 이름, 나중에 서버에서 받아온 거로 default 채워야함.
  const [slideTitle, setSlideTitle] = useState('슬라이드 1');
  // 0-2. 타이틀 저장 버튼(서버 요청)
  // const handleSaveSlideTitle = () => {
  //
  // };

  // 1. 이모지버튼 ( 그대로 유지 )
  const [isEmogiClick, setEmogiClick] = useState(false);

  const handleEmogiClick = () => {
    setEmogiClick((prev) => !prev);
  };

  // 2. 변경기록 버튼
  const scriptHistory = useToggle(false);
  // 3. 의견 버튼
  const opinion = useToggle(false);
  // 3-1. 답변 (나중에 피드백id랑 매칭해야됨)
  // 어떤 댓글에 답글 입력창이 열려있는지
  const [activeReplyIdx, setActiveReplyIdx] = useState<number | null>(null);

  //  답글 입력값(일단 1개만)
  const [replyText, setReplyText] = useState('');

  // 4. 대본섹션 닫기 토글
  const scriptBoxDock = useToggle(false);

  return (
    <>
      <div
        /* 접힘=true면 전체높이(320) 중 헤더(40)만 남기고 아래로 숨김 */
        className={`
            fixed left-0 right-0 bottom-0 z-30
            mx-auto w-full
            bg-white
            transition-transform duration-300 ease-out
            h-[320px]
            ${scriptBoxDock.value ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'}
            `}
      >
        {/* 변경: 상단바 내부 레이아웃(좌/우 정렬) */}
        <div className="h-10 px-5 py-2 flex items-center justify-between border-b border-zinc-200">
          {/* 슬라이드 제목 변경 */}
          <SlideTitle
            slideNameChange={slideNameChange}
            slideTitle={slideTitle}
            setSlideTitle={setSlideTitle}
          />

          {/* 우측 컨트롤 영역 */}
          <div className="flex items-center gap-4">
            {/* 이모지 카운트 영역 -> 컴포넌트로 분리 */}
            <ScriptBoxEmogi isEmogiClick={isEmogiClick} handleEmogiClick={handleEmogiClick} />

            {/* 변경기록/의견 버튼 그룹 */}
            <div className="flex items-center gap-2">
              {/* 변경기록 */}
              <ScriptHistory scriptHistory={scriptHistory} />

              {/* 의견(댓글)기록 */}
              <Opinion
                opinion={opinion}
                activeReplyIdx={activeReplyIdx}
                setActiveReplyIdx={setActiveReplyIdx}
                replyText={replyText}
                setReplyText={setReplyText}
              />
            </div>

            {/* 전체 Script Box 열림 닫힘 버튼*/}
            <button
              type="button"
              onClick={scriptBoxDock.toggle}
              className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center"
              aria-label="more"
              aria-expanded={!scriptBoxDock.value}
            >
              <img
                src={smallArrowIcon}
                className={`
                      w-4 h-4
                      transition-transform duration-300 ease-out
                      ${scriptBoxDock.value ? 'rotate-180' : 'rotate-0'}
                    `}
              />
            </button>
          </div>
        </div>

        {/* "대본 입력 영역" textarea */}
        <div className="w-full bg-white">
          <textarea
            className="
              w-full min-h-[250px] resize-none
              px-5 py-4
              text-zinc-700 text-sm leading-6
              placeholder:text-gray-400
              outline-none
              rounded-bl-lg rounded-br-lg
            "
            placeholder="슬라이드 대본을 입력하세요..."
          />
        </div>
      </div>
    </>
  );
};

export default ScriptBox;
