import { useState } from 'react';

import clsx from 'clsx';

import smallArrowIcon from '../../assets/icons/smallArrowIcon.svg';
import Opinion from './Opinion';
import ScriptBoxEmoji from './ScriptBoxEmoji';
import ScriptHistory from './ScriptHistory';
import SlideTitle from './SlideTitle';

interface ScriptBoxHeaderProps {
  slideTitle: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ScriptBoxHeader({
  slideTitle: initialSlideTitle,
  isCollapsed,
  onToggleCollapse,
}: ScriptBoxHeaderProps) {
  // SlideTitle 관련 상태
  const [slideTitle, setSlideTitle] = useState(initialSlideTitle);
  const [isSlideNameOpen, setIsSlideNameOpen] = useState(false);

  // Emoji 관련 상태
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  // History 관련 상태
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Opinion 관련 상태
  const [isOpinionOpen, setIsOpinionOpen] = useState(false);
  const [activeReplyIdx, setActiveReplyIdx] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* 좌측: 접기 버튼 + 슬라이드 제목 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? '대본 펼치기' : '대본 접기'}
        >
          <img
            src={smallArrowIcon}
            alt=""
            className={clsx(
              'h-4 w-4 transition-transform duration-300',
              !isCollapsed && 'rotate-180',
            )}
          />
        </button>

        <SlideTitle
          slideNameChange={{
            value: isSlideNameOpen,
            toggle: () => setIsSlideNameOpen((prev) => !prev),
            off: () => setIsSlideNameOpen(false),
          }}
          slideTitle={slideTitle}
          setSlideTitle={setSlideTitle}
        />
      </div>

      {/* 우측: 이모지, 변경기록, 의견 */}
      <div className="flex items-center gap-3">
        <ScriptBoxEmoji
          isEmojiOpen={isEmojiOpen}
          onToggle={() => setIsEmojiOpen((prev) => !prev)}
        />

        <ScriptHistory
          scriptHistory={{
            value: isHistoryOpen,
            toggle: () => setIsHistoryOpen((prev) => !prev),
            off: () => setIsHistoryOpen(false),
          }}
        />

        <Opinion
          opinion={{
            value: isOpinionOpen,
            toggle: () => setIsOpinionOpen((prev) => !prev),
            off: () => setIsOpinionOpen(false),
          }}
          activeReplyIdx={activeReplyIdx}
          setActiveReplyIdx={setActiveReplyIdx}
          replyText={replyText}
          setReplyText={setReplyText}
        />
      </div>
    </div>
  );
}
