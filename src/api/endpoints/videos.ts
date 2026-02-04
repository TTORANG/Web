import { apiClient } from '@/api';
import type {
  ChunkUploadResponseDto,
  FinishVideoRequestDto,
  FinishVideoResponseDto,
  StartVideoRequestDto,
  StartVideoResponseDto,
} from '@/api/dto';
import type { ApiResponse } from '@/types/api';

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
  finishVideo: (videoId: number, data: FinishVideoRequestDto) =>
    apiClient.post<ApiResponse<FinishVideoResponseDto>>(`/videos/${videoId}/finish`, data),

  // GET /videos/{videoId} - 영상 상세 조회
  getVideoDetail: (videoId: number) => apiClient.get(`/videos/${videoId}`),

  // GET /videos/{videoId}/slides - 슬라이드 타임라인 조회
  getVideoSlides: (videoId: number) => apiClient.get(`/videos/${videoId}/slides`),
};
