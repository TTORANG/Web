/**
 * @file useSlides.ts
 * @description 슬라이드 관련 TanStack Query 훅
 *
 * 이 훅들을 컴포넌트에서 사용하면:
 * - 로딩 상태 자동 관리 (isLoading)
 * - 에러 상태 자동 관리 (isError, error)
 * - 캐싱 자동 처리
 * - 백그라운드 리패치
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type UpdateSlideRequest,
  createSlide,
  deleteSlide,
  getSlide,
  getSlides,
  updateSlide,
} from '@/api/endpoints/slides';
import { queryKeys } from '@/api/queryClient';

/**
 * 슬라이드 목록 조회 훅
 *
 * @param projectId - 프로젝트 ID
 *
 * @example
 * function SlideList({ projectId }) {
 *   const { data: slides, isLoading, isError } = useSlides(projectId);
 *
 *   if (isLoading) return <div>로딩 중...</div>;
 *   if (isError) return <div>에러 발생!</div>;
 *
 *   return slides.map(slide => <div key={slide.id}>{slide.title}</div>);
 * }
 */
export function useSlides(projectId: string) {
  return useQuery({
    // 캐시 키 - 이 키로 캐시를 식별하고 무효화함
    queryKey: queryKeys.slides.list(projectId),

    // 실제 데이터 fetching 함수
    queryFn: () => getSlides(projectId),

    // projectId가 있을 때만 요청
    enabled: !!projectId,
  });
}

/**
 * 단일 슬라이드 조회 훅
 *
 * @param slideId - 슬라이드 ID
 */
export function useSlide(slideId: string) {
  return useQuery({
    queryKey: queryKeys.slides.detail(slideId),
    queryFn: () => getSlide(slideId),
    enabled: !!slideId,
  });
}

/**
 * 슬라이드 수정 훅 (mutation)
 *
 * @example
 * function EditSlide({ slideId }) {
 *   const { mutate: update, isPending } = useUpdateSlide();
 *
 *   const handleSave = () => {
 *     update(
 *       { slideId, data: { title: '새 제목' } },
 *       {
 *         onSuccess: () => alert('저장 완료!'),
 *         onError: () => alert('저장 실패!'),
 *       }
 *     );
 *   };
 *
 *   return <button onClick={handleSave} disabled={isPending}>저장</button>;
 * }
 */
export function useUpdateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutation 함수
    mutationFn: ({ slideId, data }: { slideId: string; data: UpdateSlideRequest }) =>
      updateSlide(slideId, data),

    // 성공 시 관련 쿼리 캐시 무효화 (자동 리패치)
    onSuccess: (_, { slideId }) => {
      // 해당 슬라이드 상세 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.detail(slideId) });
      // 슬라이드 목록 캐시도 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.lists() });
    },
  });
}

/**
 * 슬라이드 생성 훅
 */
export function useCreateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: { title: string; script?: string };
    }) => createSlide(projectId, data),

    onSuccess: (_, { projectId }) => {
      // 슬라이드 목록 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.list(projectId) });
    },
  });
}

/**
 * 슬라이드 삭제 훅
 */
export function useDeleteSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slideId: string) => deleteSlide(slideId),

    onSuccess: () => {
      // 모든 슬라이드 관련 캐시 무효화
      void queryClient.invalidateQueries({ queryKey: queryKeys.slides.all });
    },
  });
}
