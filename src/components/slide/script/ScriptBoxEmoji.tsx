/**
 * @file ScriptBoxEmoji.tsx
 * @description 이모지 반응 표시 및 더보기 팝오버
 *
 * 대본에 대한 이모지 반응을 표시하고, 더보기 버튼으로 전체 목록을 볼 수 있습니다.
 * Zustand store를 통해 이모지 반응 데이터를 읽습니다.
 */
import { Popover } from '@/components/common';
import { useSlideEmojis } from '@/hooks';
import { REACTION_CONFIG } from '@/types/script';

export default function ScriptBoxEmoji() {
  const emojiReactions = useSlideEmojis();

  // count가 0보다 큰 리액션만 필터링
  const activeReactions = emojiReactions.filter((r) => r.count > 0);

  const mainEmojis = activeReactions.slice(0, 2);
  const extendedEmojis = activeReactions.slice(2);
  const hasExtended = extendedEmojis.length > 0;
  const trigger = (
    <button
      type="button"
      className="h-7 rounded bg-transparent px-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-main"
    >
      ···
    </button>
  );

  if (activeReactions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* 메인 이모지 카운트 */}
      <div className="flex items-center gap-6">
        {mainEmojis.map(({ type, count }) => {
          const config = REACTION_CONFIG[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <span className="text-base leading-6 text-gray-800">{config.emoji}</span>
              <span className="text-base leading-6 text-gray-800">
                {count > 99 ? '99+' : count}
              </span>
            </div>
          );
        })}
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
            {extendedEmojis.map(({ type, count }) => {
              const config = REACTION_CONFIG[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-center text-base leading-6 text-gray-800">
                    {config.emoji}
                  </span>
                  <span className="text-center text-base leading-6 text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </Popover>
      )}
    </div>
  );
}
