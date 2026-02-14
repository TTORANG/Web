import { apiClient } from '@/api/client';
import type { CreateCommentResponseDto, CreateReplyCommentResponseDto } from '@/api/dto';
import type {
  CreateChunkUploadResponseDto,
  CreateCommentRequestDto,
  CreateFinishVideoRequestDto,
  CreateFinishVideoResponseDto,
  CreateStartVideoRequestDto,
  CreateStartVideoResponseDto,
  ReadPresentationVideosResponseDto,
  ReadVideoCommentsAllResponseDto,
  ReadVideoDetailResponseDto,
  ReadVideoSlidesResponseDto,
} from '@/api/dto/video.dto';
import type { ApiResponse } from '@/types/api';

const normalizeVideoId = (videoId: string | number): number => {
  const numericId = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
  if (isNaN(numericId)) {
    throw new Error(`Invalid videoId: ${videoId}`);
  }
  return numericId;
};

export const videosApi = {
  startVideo: (data: CreateStartVideoRequestDto) =>
    apiClient.post<ApiResponse<CreateStartVideoResponseDto>>('/videos/start', data),

  uploadChunk: (videoId: string, chunkIndex: number, file: Blob) => {
    const formData = new FormData();
    const normalizedType = file.type.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
    const ext = normalizedType === 'video/mp4' ? 'mp4' : 'webm';
    const normalizedFile = new File([file], `chunk-${chunkIndex}.${ext}`, { type: normalizedType });
    formData.append('file', normalizedFile);
    const numericId = normalizeVideoId(videoId);

    return apiClient.post<ApiResponse<CreateChunkUploadResponseDto>>(
      `/videos/${numericId}/chunks/${chunkIndex}`,
      formData,
      {
        // FormData는 브라우저가 boundary를 포함한 Content-Type을 자동 설정해야 multer가 파일을 파싱할 수 있음
        // Content-Type을 undefined로 하지 않으면 서버에서 req.file이 비어 오류가 발생함
        headers: { 'Content-Type': undefined },
      },
    );
  },

  finishVideo: (videoId: string, data: CreateFinishVideoRequestDto) => {
    const numericId = normalizeVideoId(videoId);
    return apiClient.post<ApiResponse<CreateFinishVideoResponseDto>>(
      `/videos/${numericId}/finish`,
      data,
    );
  },

  getVideoDetail: (videoId: string) => {
    const numericId = normalizeVideoId(videoId);
    return apiClient.get<ApiResponse<ReadVideoDetailResponseDto>>(`/videos/${numericId}`);
  },

  getVideoSlides: (videoId: string) => {
    const numericId = normalizeVideoId(videoId);
    return apiClient.get<ApiResponse<ReadVideoSlidesResponseDto>>(`/videos/${numericId}/slides`);
  },

  /** 영상 전체 댓글/답글 목록 조회 */
  getVideoCommentsAll: (videoId: string) => {
    const numericId = normalizeVideoId(videoId);
    return apiClient.get<ApiResponse<ReadVideoCommentsAllResponseDto>>(
      `/videos/${numericId}/comments/all`,
    );
  },
  // DELETE /videos/{videoId} - 영상 삭제
  deleteVideo: (videoId: string) => {
    const numericId = normalizeVideoId(videoId);
    return apiClient.delete<ApiResponse<{ videoId: string }>>(`/videos/${numericId}`);
  },

  getPresentationVideos: (
    projectId: string,
    params?: {
      search?: string;
      filter?: string;
      sort?: string;
    },
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.filter) searchParams.set('filter', params.filter);
    if (params?.sort) searchParams.set('sort', params.sort);

    const queryString = searchParams.toString();
    const url = `/presentations/${encodeURIComponent(projectId)}/videos${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ApiResponse<ReadPresentationVideosResponseDto>>(url);
  },
  /**
   * 영상 제목 및 생성일 조회
   */
  async getVideoTitle(videoId: string) {
    const response = await apiClient.get<
      ApiResponse<{ videoId: string; title: string; createdAt: string }>
    >(`/videos/${videoId}/title`);
    return response.data;
  },

  /**
   * 영상 제목 수정
   */
  async updateVideoTitle(videoId: string, title: string) {
    const response = await apiClient.patch<
      ApiResponse<{ videoId: string; title: string; updatedAt: string }>
    >(`/videos/${videoId}`, { title });

    if (response.data.resultType === 'SUCCESS') {
      return response.data.success;
    }

    throw new Error(response.data.error.reason);
  },
};

export async function createVideoComment(
  videoId: string,
  data: CreateCommentRequestDto & { timestampMs?: number },
): Promise<{ serverId: string; content: string }> {
  const numericId = normalizeVideoId(videoId);
  const response = await apiClient.post<ApiResponse<CreateCommentResponseDto>>(
    `/videos/${numericId}/comments`,
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

export async function createCommentReply(
  commentId: string,
  data: CreateCommentRequestDto,
): Promise<{ serverId: string; content: string }> {
  const response = await apiClient.post<ApiResponse<CreateReplyCommentResponseDto>>(
    `/comments/${encodeURIComponent(commentId)}/replies`,
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

export async function deleteVideoComment(commentId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/comments/${encodeURIComponent(commentId)}`,
  );

  if (response.data.resultType === 'FAILURE') {
    throw new Error(response.data.error.reason);
  }
}
