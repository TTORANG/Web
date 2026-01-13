import { useMemo } from 'react';

import { useSlideStore } from '@/stores/slideStore';
// utils 확인
import type { CommentItem } from '@/types/comment';
// 경로 확인
import { flatToTree } from '@/utils/comment';

// ✅ [중요] 빈 배열 참조를 고정하기 위해 컴포넌트 밖으로 뺍니다.
// 내부에서 []를 직접 리턴하면 렌더링마다 새로운 배열로 인식되어 무한 루프가 발생합니다.
const EMPTY_COMMENTS: CommentItem[] = [];

export function useComments() {
  // ✅ [수정 1] Selector를 각각 분리하여 가져옵니다.
  // 객체로 묶어서 가져오면 ({ a, b }) 매번 새로운 객체가 생성되어 리렌더링을 유발할 수 있습니다.
  const flatComments = useSlideStore((state) => state.slide?.opinions);
  const addOpinionStore = useSlideStore((state) => state.addOpinion);
  const addReplyStore = useSlideStore((state) => state.addReply);
  const deleteOpinionStore = useSlideStore((state) => state.deleteOpinion);

  // ✅ [수정 2] useMemo를 사용하여 Tree 변환 비용 최적화 및 참조 유지
  const comments = useMemo(() => {
    // flatComments가 없으면(null/undefined) 고정된 빈 배열 반환
    if (!flatComments) return EMPTY_COMMENTS;

    // Flat 데이터를 Tree 구조로 변환
    return flatToTree(flatComments);
  }, [flatComments]);

  // UI 인터페이스 연결 (Wrapper 함수들)
  const addComment = (content: string, currentSlideIndex: number) => {
    addOpinionStore(content, currentSlideIndex);
  };

  const addReply = (targetId: string, content: string) => {
    addReplyStore(targetId, content);
  };

  const deleteComment = (targetId: string) => {
    deleteOpinionStore(targetId);
  };

  return {
    comments,
    addComment,
    addReply,
    deleteComment,
  };
}
