type ScriptBoxEmogiProps = {
  isEmogiClick: boolean; // 변수명 그대로 유지: isEmogiClick
  handleEmogiClick: () => void; // 핸들러명 그대로 유지: handleEmogiClick
};

const ScriptBoxEmogi = ({ isEmogiClick, handleEmogiClick }: ScriptBoxEmogiProps) => {
  return (
    <>
      {/*  (기존 그대로) 이모지 카운트 영역 */}
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

      {/*  (기존 그대로) 이모지 버튼 + popover */}
      <div className="relative">
        <button
          className="h-7 px-2 rounded  hover:bg-zinc-100"
          // ✅ 부모에서 내려준 handleEmogiClick 그대로 연결
          onClick={handleEmogiClick}
          // ✅ 부모에서 내려준 isEmogiClick 그대로 연결
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
    </>
  );
};

export default ScriptBoxEmogi;
