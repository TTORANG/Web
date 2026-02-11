import { apiClient } from '@/api/client';
import type { CreateCommentResponseDto, CreateReplyCommentResponseDto } from '@/api/dto';
import type {
  CreateChunkUploadResponseDto,
  CreateCommentRequestDto,
  CreateFinishVideoRequestDto,
  CreateFinishVideoResponseDto,
  CreateStartVideoRequestDto,
  CreateStartVideoResponseDto,
  ReadProjectVideosResponseDto,
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
    formData.append('file', file);
    const numericId = normalizeVideoId(videoId);

    return apiClient.post<ApiResponse<CreateChunkUploadResponseDto>>(
      `/videos/${numericId}/chunks/${chunkIndex}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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

  getProjectVideos: (
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

    return apiClient.get<ApiResponse<ReadProjectVideosResponseDto>>(url);
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
