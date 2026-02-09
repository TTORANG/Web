import { apiClient } from '@/api/client';
import type {
  ChunkUploadResponseDto,
  CreateCommentResponseDto,
  CreateReplyCommentResponseDto,
  FinishVideoRequestDto,
  FinishVideoResponseDto,
  GetVideoDetailResponseDto,
  GetVideoSlidesResponseDto,
  StartVideoRequestDto,
  StartVideoResponseDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';

// ============================================================================
// 레거시 videosApi 객체 (하위 호환성 유지)
// useVideoUpload 등 기존 코드에서 사용 중
// ============================================================================
export const videosApi = {
  // POST /videos/start - 영상 녹화 세션 생성
  startVideo: (data: StartVideoRequestDto) =>
    apiClient.post<ApiResponse<StartVideoResponseDto>>('/videos/start', data),

  // POST /videos/{videoId}/chunks/{chunkIndex} - 청크 업로드
  uploadChunk: (videoId: string, chunkIndex: number, file: Blob) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ApiResponse<ChunkUploadResponseDto>>(
      `/videos/${videoId}/chunks/${chunkIndex}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  // POST /videos/{videoId}/finish - 녹화 종료 및 영상 처리 시작
  finishVideo: (videoId: string, data: FinishVideoRequestDto) =>
    apiClient.post<ApiResponse<FinishVideoResponseDto>>(`/videos/${videoId}/finish`, data),

  // GET /videos/{videoId} - 영상 상세 조회
  getVideoDetail: (videoId: string) =>
    apiClient.get<ApiResponse<GetVideoDetailResponseDto>>(`/videos/${videoId}`),

  // GET /videos/{videoId}/slides - 슬라이드 타임라인 조회
  getVideoSlides: (videoId: string) =>
    apiClient.get<ApiResponse<GetVideoSlidesResponseDto>>(`/videos/${videoId}/slides`),
};

// ============================================================================
// 신규 개별 함수 export (컨벤션 준수)
// useVideoComments에서 사용
// ============================================================================

/**
 * 비디오에 댓글 작성 (POST)
 *
 * @param videoId - 비디오 ID
 * @param data - 댓글 내용 및 타임스탬프
 * @returns Model - serverId와 content
 */
export async function createVideoComment(
  videoId: string,
  data: { content: string; timestampMs?: number },
): Promise<{ serverId: string; content: string }> {
  const response = await apiClient.post<ApiResponse<CreateCommentResponseDto>>(
    `/videos/${videoId}/comments`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return {
      serverId: response.data.success.commentId,
      content: response.data.success.content,
    };
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글에 답글 작성 (POST)
 *
 * @param commentId - 부모 댓글 ID
 * @param data - 답글 내용
 * @returns Model - serverId와 content
 */
export async function createCommentReply(
  commentId: string,
  data: { content: string },
): Promise<{ serverId: string; content: string }> {
  const response = await apiClient.post<ApiResponse<CreateReplyCommentResponseDto>>(
    `/comments/${commentId}/replies`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return {
      serverId: response.data.success.replyId,
      content: response.data.success.content,
    };
  }
  throw new Error(response.data.error.reason);
}

/**
 * 댓글 삭제 (DELETE)
 *
 * @param commentId - 댓글 ID
 */
export async function deleteVideoComment(commentId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(`/comments/${commentId}`);

  if (response.data.resultType === 'FAILURE') {
    throw new Error(response.data.error.reason);
  }
}
