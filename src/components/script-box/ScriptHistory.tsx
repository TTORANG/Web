import refreshIcon from '../../assets/icons/refreshIcon.svg';

type ScriptHistoryProps = {
  scriptHistory: {
    value: boolean;
    toggle: () => void;
    off: () => void;
  };
};

const ScriptHistory = ({ scriptHistory }: ScriptHistoryProps) => {
  return (
    <div className="relative">
      {/* (기존 그대로) 변경기록 버튼 */}
      <button
        onClick={scriptHistory.toggle}
        className={`
          h-7 pl-2 pr-1.5 rounded outline outline-1 -outline-offset-1
          inline-flex items-center gap-1
          ${
            scriptHistory.value
              ? 'outline-indigo-500 text-indigo-500 bg-white'
              : 'outline-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50'
          }
        `}
        aria-pressed={scriptHistory.value}
      >
        <span className="text-sm font-semibold leading-5">변경 기록</span>
        <img src={refreshIcon} className="w-4 h-4" />
      </button>

      {/* (기존 그대로) 변경기록 popover */}
      {scriptHistory.value && (
        <>
          {/* 바깥 클릭 시 닫기 */}
          <div className="fixed inset-0 z-40" onClick={scriptHistory.off} />

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
              <div className="text-zinc-700 text-base font-semibold leading-6">대본 변경 기록</div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <div className="px-4 pt-3 pb-4 bg-gray-100 border-b border-zinc-200">
                <div className="flex flex-col gap-3">
                  <div className="text-gray-500 text-xs font-semibold leading-4">현재</div>
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
                      <span className="text-zinc-700 text-xs font-semibold leading-4">복원</span>
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
  );
};

export default ScriptHistory;
