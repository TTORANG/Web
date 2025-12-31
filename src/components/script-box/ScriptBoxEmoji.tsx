import { Popover } from '../common';

const EMOJI_DATA = [
  { emoji: '👍', count: 99 },
  { emoji: '😡', count: 12 },
];

const EMOJI_EXTENDED_DATA = [
  [
    { emoji: '😏', count: 15 },
    { emoji: '❤️', count: 28 },
    { emoji: '😎', count: 5 },
    { emoji: '👀', count: 182 },
    { emoji: '🤪', count: 3 },
  ],
  [
    { emoji: '💡', count: 11 },
    { emoji: '🙈', count: 488 },
    { emoji: '💕', count: 2 },
    { emoji: '😂', count: 46 },
    { emoji: '🤓', count: 36 },
  ],
];

export default function ScriptBoxEmoji() {
  const trigger = (
    <button type="button" className="h-7 rounded px-2 hover:bg-gray-100" aria-label="이모지 더보기">
      ···
    </button>
  );

  return (
    <div className="flex items-center gap-3">
      {/* 메인 이모지 카운트 */}
      <div className="flex items-center gap-6">
        {EMOJI_DATA.map(({ emoji, count }) => (
          <div key={emoji} className="flex items-center gap-2">
            <span className="text-base leading-6 text-gray-800">{emoji}</span>
            <span className="text-base leading-6 text-gray-800">{count > 99 ? '99+' : count}</span>
          </div>
        ))}
      </div>

      {/* 이모지 더보기 팝오버 */}
      <Popover
        trigger={trigger}
        position="top"
        align="end"
        ariaLabel="이모지 반응 목록"
        className="px-4 py-3"
      >
        <div className="flex flex-col gap-3">
          {EMOJI_EXTENDED_DATA.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-6">
              {row.map(({ emoji, count }) => (
                <div key={emoji} className="flex items-center gap-2">
                  <span className="text-center text-base leading-6 text-gray-800">{emoji}</span>
                  <span className="text-center text-base leading-6 text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Popover>
    </div>
  );
}
