import { apiClient } from '@/api';
import type {
  ChunkUploadResponseDto,
  FinishVideoRequestDto,
  FinishVideoResponseDto,
  StartVideoRequestDto,
  StartVideoResponseDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';

import type { GetProjectVideosResponseDto } from '../dto/video.dto';

export const videosApi = {
  // POST /videos/start - 영상 녹화 세션 생성
  startVideo: (data: StartVideoRequestDto) =>
    apiClient.post<ApiResponse<StartVideoResponseDto>>('/videos/start', data),

  // POST /videos/{videoId}/chunks/{chunkIndex} - 청크 업로드
  uploadChunk: (videoId: number, chunkIndex: number, file: Blob) => {
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
  getVideoDetail: (videoId: string) => apiClient.get(`/videos/${videoId}`),

  // GET /videos/{videoId}/slides - 슬라이드 타임라인 조회
  getVideoSlides: (videoId: string) => apiClient.get(`/videos/${videoId}/slides`),
  /**
   * GET /presentations/:projectId/videos - 프로젝트별 영상 목록 조회
   */
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
    const url = `/presentations/${projectId}/videos${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ApiResponse<GetProjectVideosResponseDto>>(url);
  },
};
