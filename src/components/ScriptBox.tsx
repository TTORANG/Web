import { useState } from 'react';

import refreshIcon from '../assets/icons/refreshIcon.svg';
import replyIcon from '../assets/icons/replyIcon.svg';
import smallArrowIcon from '../assets/icons/smallArrowIcon.svg';
import treshcanIcon from '../assets/icons/treshcanIcon.svg';
import { useToggle } from '../hooks/useToggle';

const ScriptBox = () => {
  // 0. 슬라이드 이름(이름 변경) 버튼
  const slideNameChange = useToggle(false);
  // 0-1. 현재 슬라이드 이름
  const [slideTitle, setSlideTitle] = useState('슬라이드 1');
  // 0-2. 타이틀 저장 버튼(서버 요청)
  // const handleSaveSlideTitle = () => {
  //
  // };

  // 1. 이모지버튼
  const [isEmogiClick, setEmogiClick] = useState(false);

  const handleEmogiClick = () => {
    SetEmogiClick((prev) => !prev);
  };

  // 2. 변경기록 버튼
  const scriptHistroy = useToggle(false);
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
            fixed left-0 right-0 bottom-0 z-30  /* 변경: 화면 하단에 고정 */
            mx-auto w-full
            bg-white

            transition-transform duration-300 ease-out  /* 변경: 부드럽게 이동 */
            h-[320px]                               /* 변경: 드로어 전체 높이(원하는 값으로 조절) */
            ${scriptBoxDock.value ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'}

            `}
      >
        {/* 변경: 상단바 내부 레이아웃(좌/우 정렬) */}

        <div className="h-10 px-5 py-2 flex items-center justify-between border-b border-zinc-200">
          <div className="relative inline-block">
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

            {/* 슬라이드 이름변경 popover */}
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

          {/* 우측 컨트롤 영역 */}
          <div className="flex items-center gap-4">
            {/* 이모지 카운트 영역 */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="text-zinc-700 text-base leading-6">👍</div>
                <div className="text-zinc-700 text-base leading-6">99+</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-zinc-700 text-base leading-6">😡</div>
                <div className="text-zinc-700 text-base leading-6">12</div>
              </div>
            </div>

            {/* 변경: 이모지 버튼을 오른쪽 컨트롤 쪽에 자연스럽게 배치 + popover 기준점 유지 */}
            <div className="relative">
              <button
                className="h-7 px-2 rounded  hover:bg-zinc-100"
                onClick={handleEmogiClick}
                aria-expanded={isEmogiClick}
              >
                ...
              </button>

              {isEmogiClick && ( // 받은 이모티콘 서버에서 뿌려줌
                <div
                  className="
                    px-4 py-3 bg-white rounded-lg
                    shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]
                    inline-flex flex-col justify-start items-start gap-3
                    absolute right-0 bottom-full mb-2 origin-bottom-right z-50
                  "
                >
                  <div className="inline-flex justify-start items-center gap-6">
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">😏</div>
                      <div className="text-center text-zinc-700 text-base leading-6">15</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">❤️</div>
                      <div className="text-center text-zinc-700 text-base leading-6">28</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">😎️</div>
                      <div className="text-center text-zinc-700 text-base leading-6">5</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">👀</div>
                      <div className="text-center text-zinc-700 text-base leading-6">182</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">🤪</div>
                      <div className="text-center text-zinc-700 text-base leading-6">3</div>
                    </div>
                  </div>
                  <div className="inline-flex justify-start items-center gap-6">
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">💡</div>
                      <div className="text-center text-zinc-700 text-base leading-6">11</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">🙈️</div>
                      <div className="text-center text-zinc-700 text-base leading-6">488</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">💕</div>
                      <div className="text-center text-zinc-700 text-base leading-6">2</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">😂</div>
                      <div className="text-center text-zinc-700 text-base leading-6">46</div>
                    </div>
                    <div className="flex justify-start items-center gap-2">
                      <div className="text-center text-zinc-700 text-base leading-6">🤓</div>
                      <div className="text-center text-zinc-700 text-base leading-6">36</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 변경: 변경기록/의견 버튼 그룹 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={scriptHistroy.toggle}
                  className={`
                    h-7 pl-2 pr-1.5 rounded outline outline-1 outline-offset-[-1px]
                    inline-flex items-center gap-1
                    ${scriptHistroy.value ? 'outline-indigo-500 text-indigo-500 bg-white' : 'outline-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50'}
                  `}
                  aria-pressed={scriptHistroy.value}
                >
                  <span className="text-sm font-semibold leading-5">변경 기록</span>
                  <img src={refreshIcon} className="w-4 h-4" />
                </button>

                {scriptHistroy.value && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={scriptHistroy.off} />

                    <div
                      className="absolute z-50
                        right-0 bottom-full mb-2
                        origin-bottom-right
                        w-[384px] max-w-[90vw]
                        rounded-lg overflow-hidden bg-white
                        shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]
                        "
                    >
                      <div className="px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between">
                        <div className="text-zinc-700 text-base font-semibold leading-6">
                          대본 변경 기록
                        </div>
                      </div>

                      <div className="max-h-[320px] overflow-y-auto">
                        <div className="px-4 pt-3 pb-4 bg-gray-100 border-b border-zinc-200">
                          <div className="flex flex-col gap-3">
                            <div className="text-gray-500 text-xs font-semibold leading-4">
                              현재
                            </div>
                            <div className="text-zinc-700 text-sm font-medium leading-5">
                              (현재 대본 내용이 들어올 자리)
                            </div>
                          </div>
                        </div>

                        {[0, 1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className="px-4 pt-2 pb-4 bg-white border-b border-zinc-200"
                            title=""
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-gray-500 text-xs font-medium leading-4">
                                (시간 표시 자리)
                              </div>

                              <button
                                type="button"
                                className="
                                  pl-2 pr-1.5 py-1 bg-white rounded
                                  outline outline-1 outline-offset-[-1px] outline-zinc-200
                                  inline-flex items-center gap-1
                                  hover:bg-gray-50 active:scale-[0.99] transition
                                "
                              >
                                <span className="text-zinc-700 text-xs font-semibold leading-4">
                                  복원
                                </span>
                                <img src={refreshIcon} className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mt-2 text-zinc-700 text-sm font-medium leading-5">
                              (이전 대본 내용 자리 #{idx + 1})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative inline-block align-top">
                <button
                  onClick={opinion.toggle}
                  className={`
                    h-7 px-2 rounded outline outline-1 outline-offset-[-1px]
                    inline-flex items-center gap-1
                    ${opinion.value ? 'outline-indigo-500 text-indigo-500 bg-white' : 'outline-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50'}
                  `}
                  aria-pressed={opinion.value} // x토글상태인지 스크린리더에게 알려주는
                >
                  <span className="text-sm font-semibold leading-5">의견</span>
                  <span
                    className={`${opinion.value ? 'text-indigo-500' : 'text-gray-500'} text-sm font-semibold leading-5`}
                  >
                    3
                  </span>
                </button>

                {/* 의견 pop over */}
                {opinion.value && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={opinion.off} />

                    {/* popover 위치 = 버튼 right edge에 붙이고 왼쪽으로 펼쳐지게 */}
                    <div
                      className="absolute z-50
                        right-0 bottom-full mb-2
                        origin-bottom-right
                        w-[384px] max-w-[90vw]
                        rounded-lg overflow-hidden bg-white
                        shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]
                        "
                    >
                      <div className="px-4 py-3 bg-white border-b border-zinc-200 flex items-center justify-between">
                        <div className="text-zinc-700 text-base font-semibold leading-6">의견</div>
                      </div>

                      <div className="h-80 overflow-y-auto">
                        {[0, 1, 2, 3].map((idx) => {
                          const isMine = idx < 2;
                          const hasReply = idx === 2;

                          return (
                            <div
                              key={idx}
                              className={`
                                ${hasReply ? 'pl-14 pr-4' : 'px-4'}
                                py-3 bg-white
                                flex items-start gap-3
                              `}
                              title={''}
                            >
                              <div className="h-20 flex items-start gap-2.5">
                                <div className="w-8 h-8 bg-zinc-300 rounded-full" />
                              </div>

                              <div className="flex-1 pt-1.5 flex flex-col gap-1">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="max-w-48 text-zinc-700 text-sm font-semibold leading-5 line-clamp-1">
                                        {isMine ? '익명 사용자' : '김철수'}
                                      </div>
                                      <div className="text-gray-500 text-xs font-medium leading-4">
                                        {idx === 0 ? '방금 전' : '1시간 전'}
                                      </div>
                                    </div>

                                    {isMine && (
                                      <button
                                        type="button"
                                        className="flex items-center gap-1 text-red-500 text-xs font-semibold leading-4 hover:opacity-80"
                                      >
                                        삭제
                                        <img src={treshcanIcon} className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="text-zinc-700 text-sm font-medium leading-5">
                                    이 부분 설명이 명확해요!
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 text-indigo-500 text-xs font-semibold leading-4 hover:opacity-80"
                                    onClick={() => {
                                      // ✅ 같은 댓글을 다시 누르면 닫기(toggle)
                                      setActiveReplyIdx((prev) => (prev === idx ? null : idx));
                                      setReplyText(''); // ✅ 새로 열 때 입력 초기화(원하면 제거)
                                    }}
                                  >
                                    답글
                                    <img src={replyIcon} className="w-4 h-4" />
                                  </button>

                                  {/* 답글 버튼 밑에 inputBox렌더링 */}
                                  {activeReplyIdx === idx && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <input
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="답글을 입력하세요"
                                        className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm outline-none focus:border-indigo-500"
                                      />
                                      <button
                                        type="button"
                                        className="h-10 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:opacity-90"
                                        onClick={() => {
                                          // 서버 붙기 전: 아무 것도 안 하고 닫기만
                                          setActiveReplyIdx(null);
                                          setReplyText('');
                                        }}
                                      >
                                        등록
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={scriptBoxDock.toggle} // 전체 ScriptBox 내려갔다 올라오게
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
