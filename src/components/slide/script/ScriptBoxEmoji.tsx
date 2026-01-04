/**
 * @file ScriptBoxEmoji.tsx
 * @description 이모지 반응 표시 및 더보기 팝오버
 *
 * 대본에 대한 이모지 반응을 표시하고, 더보기 버튼으로 전체 목록을 볼 수 있습니다.
 * Zustand store를 통해 이모지 반응 데이터를 읽습니다.
 */
import { Popover } from '@/components/common';
import { useSlideStore } from '@/stores/slideStore';

export default function ScriptBoxEmoji() {
  const emojiReactions = useSlideStore((state) => state.slide?.emojiReactions ?? []);

  const mainEmojis = emojiReactions.slice(0, 2);
  const extendedEmojis = emojiReactions.slice(2);
  const hasExtended = extendedEmojis.length > 0;
  const trigger = (
    <button
      type="button"
      className="h-7 rounded px-2 hover:bg-gray-100 active:bg-gray-200"
      aria-label="반응 더보기"
    >
      ···
    </button>
  );

  if (emojiReactions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* 메인 이모지 카운트 */}
      <div className="flex items-center gap-6">
        {mainEmojis.map(({ emoji, count }) => (
          <div key={emoji} className="flex items-center gap-2">
            <span className="text-base leading-6 text-gray-800">{emoji}</span>
            <span className="text-base leading-6 text-gray-800">{count > 99 ? '99+' : count}</span>
          </div>
        ))}
      </div>

      {/* 이모지 더보기 팝오버 */}
      {hasExtended && (
        <Popover
          trigger={trigger}
          position="top"
          align="end"
          ariaLabel="이모지 반응 목록"
          className="px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-6">
            {extendedEmojis.map(({ emoji, count }) => (
              <div key={emoji} className="flex items-center gap-2">
                <span className="text-center text-base leading-6 text-gray-800">{emoji}</span>
                <span className="text-center text-base leading-6 text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}
