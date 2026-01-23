import { useState } from 'react';

import { CommentInput } from '@/components/comment';
import ReactionButtons from '@/components/feedback/ReactionButtons';
import { type Reaction, type ReactionType } from '@/types/script';
import { showToast } from '@/utils/toast';

export function FeedbackTestSection() {
  const [commentDraft, setCommentDraft] = useState('');
  const [reactions, setReactions] = useState<Reaction[]>([
    { type: 'fire', count: 8 },
    { type: 'sleepy', count: 4 },
    { type: 'good', count: 99, active: true },
    { type: 'bad', count: 1 },
    { type: 'confused', count: 13 },
  ]);

  const handleToggleReaction = (type: ReactionType) => {
    setReactions((prev) =>
      prev.map((r) =>
        r.type === type
          ? { ...r, active: !r.active, count: r.active ? r.count - 1 : r.count + 1 }
          : r,
      ),
    );
  };

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    showToast.info('댓글 작성:', commentDraft);
    setCommentDraft('');
  };

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">💬 Feedback Components</h2>
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-600">
          CommentInput & ReactionButtons (Dark Theme Preview)
        </h3>
        <div
          className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 flex flex-col gap-6 px-4 pb-6 pt-2"
          data-theme="dark"
        >
          <CommentInput
            value={commentDraft}
            onChange={setCommentDraft}
            onSubmit={handleAddComment}
            onCancel={() => setCommentDraft('')}
            className="items-end w-86"
          />
          <ReactionButtons reactions={reactions} onToggleReaction={handleToggleReaction} />
        </div>
      </div>
    </section>
  );
}
