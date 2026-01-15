import { useState } from 'react';

import FeedbackInput from '@/components/feedback/FeedbackInput';
import type { EmojiReaction } from '@/types/script';
import { showToast } from '@/utils/toast';

export function FeedbackTestSection() {
  const [reactions, setReactions] = useState<EmojiReaction[]>([
    { emoji: '👍', count: 12, active: false, label: '좋아요' },
    { emoji: '🔥', count: 5, active: true, label: '최고예요' },
    { emoji: '🤔', count: 0, active: false, label: '궁금해요' },
    { emoji: '👀', count: 1, active: false, label: '확인했어요' },
  ]);

  const handleToggleReaction = (emoji: string) => {
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? { ...r, active: !r.active, count: r.active ? r.count - 1 : r.count + 1 }
          : r,
      ),
    );
  };

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">💬 Feedback Components</h2>
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-600">
          FeedbackInput (Dark Theme Preview)
        </h3>
        {/* FeedbackInput은 다크 테마에 최적화되어 있으므로 배경을 어둡게 설정 */}
        <div
          className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
          data-theme="dark"
        >
          <FeedbackInput
            reactions={reactions}
            onToggleReaction={handleToggleReaction}
            onAddComment={(content) => showToast.info('댓글 작성:', content)}
          />
        </div>
      </div>
    </section>
  );
}
