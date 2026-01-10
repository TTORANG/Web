// 우측 댓글 리스트, 댓글 리스트 렌더링과 답글 입력 상태(replyingToId, replyDraft)를 관리합니다.
// components/feedback/CommentList.tsx
import { useState } from 'react';

import clickedReplyIcon from '../../assets/component-dark/clickedReplyIcon.svg';
import fileIcon from '../../assets/component-dark/fileIcon.svg';
import replyIcon from '../../assets/component-dark/replyIcon.svg';
import type { Comment } from '../../types/feedback';

interface Props {
  comments: Comment[];
  onAddReply: (targetId: number, content: string) => void;
  onGoToSlideRef: (ref: string) => void;
}

export default function CommentList({ comments, onAddReply, onGoToSlideRef }: Props) {
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const handleReplySubmit = (targetId: number) => {
    onAddReply(targetId, replyDraft);
    setReplyDraft('');
    setReplyingToId(null);
  };

  const cancelReply = () => {
    setReplyingToId(null);
    setReplyDraft('');
  };

  return (
    <div className="mr-35 flex-1 overflow-y-auto mt-2 space-y-2">
      {comments.map((comment) => {
        const isActive = replyingToId === comment.id;

        return (
          <div
            key={comment.id}
            className={[
              'flex space-x-3 px-3 py-3 transition-colors',
              isActive ? 'bg-gray-800' : 'bg-transparent',
            ].join(' ')}
          >
            <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-body-s-bold text-white">{comment.user}</span>
                <span className="text-caption text-gray-400">{comment.time}</span>
              </div>

              <div className="mt-1 text-body-s text-white">
                {comment.slideRef && (
                  <button
                    onClick={() => comment.slideRef && onGoToSlideRef(comment.slideRef)}
                    className="text-body-s-bold text-main-variant1 hover:underline mr-1 inline-flex items-center align-middle"
                  >
                    <img src={fileIcon} alt="" />
                    &nbsp;{comment.slideRef}
                  </button>
                )}
                <span className="align-middle">{comment.content}</span>
              </div>

              <button
                onClick={() => {
                  setReplyingToId(comment.id);
                  setReplyDraft('');
                }}
                className={[
                  'flex items-center gap-1 w-fit mt-2 text-caption-bold transition',
                  isActive ? 'text-gray-400' : 'text-main hover:text-main-variant1',
                ].join(' ')}
              >
                답글
                <img src={isActive ? clickedReplyIcon : replyIcon} alt="reply" />
              </button>

              {isActive && (
                <div className="pt-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="답글을 입력하세요..."
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleReplySubmit(comment.id);
                    }}
                    className="w-full bg-transparent border-b border-gray-200 text-body-s text-white pb-2 focus:border-white outline-none placeholder-gray-400 transition-colors"
                  />

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="px-3 py-1.5 rounded-full text-caption-bold text-gray-200 text-gray-200 bg-gray-800 hover:bg-gray-900 transition"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(comment.id)}
                      className="px-3 py-1.5 rounded-full text-caption-bold text-gray-400 bg-white hover:bg-white/20 transition"
                    >
                      답글
                    </button>
                  </div>
                </div>
              )}

              {/* 대댓글 */}
              {comment.replies?.map((reply) => {
                const isReplyActive = replyingToId === reply.id;

                return (
                  <div key={reply.id} className="flex space-x-3 mt-3 py-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-body-s-bold text-white">{reply.user}</span>
                        <span className="text-caption text-gray-400">{reply.time}</span>
                      </div>

                      <div className="mt-1 text-body-s text-white">
                        <span className="align-middle">{reply.content}</span>
                      </div>

                      <button
                        onClick={() => {
                          setReplyingToId(reply.id);
                          setReplyDraft('');
                        }}
                        className={[
                          'flex items-center gap-1 w-fit mt-2 text-caption-bold transition',
                          isReplyActive ? 'text-gray-400' : 'text-main hover:text-main-variant1',
                        ].join(' ')}
                      >
                        답글
                        <img src={isReplyActive ? clickedReplyIcon : replyIcon} alt="reply" />
                      </button>

                      {isReplyActive && (
                        <div className="pt-2">
                          <input
                            type="text"
                            autoFocus
                            placeholder="답글을 입력하세요..."
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-200 text-body-s text-white pb-2 focus:border-white outline-none placeholder-gray-400 transition-colors"
                          />

                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              type="button"
                              onClick={cancelReply}
                              className="px-3 py-1.5 rounded-full text-caption-bold text-gray-200 text-gray-200 bg-gray-800 hover:bg-gray-900 transition"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(reply.id)}
                              className="px-3 py-1.5 rounded-full text-caption-bold text-gray-400 bg-white hover:bg-white/20 transition"
                            >
                              답글
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
