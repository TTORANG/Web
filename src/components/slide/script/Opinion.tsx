/**
 * @file Opinion.tsx
 * @description 의견 목록 팝오버
 *
 * 대본에 대한 팀원들의 의견을 보여주고, 답글을 달 수 있습니다.
 * API를 통해 서버와 동기화하고, Zustand store로 로컬 상태를 관리합니다.
 */
import { useState } from 'react';

import clsx from 'clsx';

import { Popover } from '@/components/common';
import OpinionItem from '@/components/slide/script/OpinionItem';
import ReplyInput from '@/components/slide/script/ReplyInput';
import {
  useCreateOpinion,
  useDeleteOpinion,
  useSlideActions,
  useSlideId,
  useSlideOpinions,
} from '@/hooks';
import { showToast } from '@/utils/toast.ts';

export default function Opinion() {
  const slideId = useSlideId();
  const opinions = useSlideOpinions();
  const {
    deleteOpinion: deleteOpinionLocal,
    addReply: addReplyLocal,
    setOpinions,
  } = useSlideActions();

  const { mutate: createOpinion } = useCreateOpinion();
  const { mutate: deleteOpinionApi } = useDeleteOpinion();

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  /**
   * 의견을 삭제합니다.
   * @param opinionId - 삭제할 의견 ID
   */
  const handleDelete = (opinionId: string) => {
    const previousOpinions = opinions; // 스냅샷 저장

    // 로컬 store 즉시 업데이트 (Optimistic UI)
    deleteOpinionLocal(opinionId);

    // API 호출
    deleteOpinionApi(
      { opinionId, slideId },
      {
        onError: () => {
          // 실패 시 롤백
          setOpinions(previousOpinions);
          showToast.error('의견 삭제에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );
  };

  /**
   * 답글을 등록합니다.
   * @param parentId - 답글을 달 의견의 ID
   */
  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;

    const previousOpinions = opinions; // 스냅샷 저장

    // 로컬 store 즉시 업데이트 (Optimistic UI)
    addReplyLocal(parentId, replyText);

    // API 호출
    createOpinion(
      { slideId, data: { content: replyText, parentId } },
      {
        onError: () => {
          // 실패 시 롤백
          setOpinions(previousOpinions);
          showToast.error('답글 등록에 실패했습니다.', '잠시 후 다시 시도해주세요.');
        },
      },
    );

    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <Popover
      trigger={({ isOpen }) => (
        <button
          type="button"
          aria-label={`의견 ${opinions.length}개 보기`}
          className={clsx(
            'inline-flex h-7 items-center gap-1 rounded px-2',
            'outline-1 -outline-offset-1',
            isOpen
              ? 'bg-white outline-main'
              : 'bg-white outline-gray-200 hover:bg-gray-100 active:bg-gray-200',
          )}
        >
          <span
            className={clsx(
              'text-sm font-semibold leading-5',
              isOpen ? 'text-main' : 'text-gray-800',
            )}
          >
            의견
          </span>
          <span
            className={clsx(
              'text-sm font-semibold leading-5',
              isOpen ? 'text-main-variant1' : 'text-gray-600',
            )}
          >
            {opinions.length}
          </span>
        </button>
      )}
      position="top"
      align="end"
      ariaLabel="의견 목록"
      className="w-popover max-w-[90vw] overflow-hidden rounded-b-lg"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <span className="text-base font-semibold leading-6 text-gray-800">의견</span>
      </div>

      {/* 의견 목록 */}
      <div className="h-80 overflow-y-auto">
        {opinions.map((opinion) => (
          <div key={opinion.id}>
            <OpinionItem
              {...opinion}
              isActive={activeReplyId === opinion.id}
              onDelete={handleDelete}
              onReplyClick={(id) => {
                setActiveReplyId(activeReplyId === id ? null : id);
                setReplyText('');
              }}
            />

            {/* 답글 입력 */}
            {activeReplyId === opinion.id && (
              <ReplyInput
                value={replyText}
                onChange={setReplyText}
                onSubmit={() => handleReplySubmit(opinion.id)}
                onCancel={() => {
                  setActiveReplyId(null);
                  setReplyText('');
                }}
              />
            )}
          </div>
        ))}
      </div>
    </Popover>
  );
}
