/**
 * @file videos.ts
 * @description 영상 관련 API 엔드포인트
 */
import { apiClient } from '@/api';
import type {
  CreateVideoCommentDto,
  CreateVideoDto,
  FinishRecordingDto,
  ToggleVideoReactionDto,
} from '@/api/dto';
import type {
  ApiResponse,
  GetVideoDetailResponse,
  VideoComment,
  VideoSlideTimeline,
} from '@/types/api';

/**
 * 영상 생성
 *
 * @param data - 영상 생성 데이터
 * @returns 생성된 영상 ID
 */
export async function createVideo(data: CreateVideoDto): Promise<{ videoId: string }> {
  const response = await apiClient.post<ApiResponse<{ videoId: string }>>('/videos', data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 영상 파일 업로드
 *
 * @param videoId - 영상 ID
 * @param file - 업로드할 파일
 * @returns 업로드 성공 여부
 */
export async function uploadVideo(videoId: string, file: File): Promise<{ ok: boolean }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(
    `/videos/${videoId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 녹화 종료 및 영상 처리 요청
 *
 * @param videoId - 영상 ID
 * @param data - 슬라이드 로그 데이터
 * @returns 처리 성공 여부
 */
export async function finishRecording(
  videoId: string,
  data: FinishRecordingDto,
): Promise<{ ok: boolean }> {
  const response = await apiClient.post<ApiResponse<{ ok: boolean }>>(
    `/videos/${videoId}/finish`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 영상 상세 조회
 *
 * @param videoId - 영상 ID
 * @returns 영상 상세 정보 및 타임라인
 */
export async function getVideoDetail(videoId: string): Promise<GetVideoDetailResponse> {
  const response = await apiClient.get<ApiResponse<GetVideoDetailResponse>>(`/videos/${videoId}`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 영상 슬라이드 타임라인 조회
 *
 * @param videoId - 영상 ID
 * @returns 슬라이드 타임라인 목록
 */
export async function getVideoSlideTimeline(
  videoId: string,
): Promise<{ slides: VideoSlideTimeline[] }> {
  const response = await apiClient.get<ApiResponse<{ slides: VideoSlideTimeline[] }>>(
    `/videos/${videoId}/slides`,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 영상 타임스탬프 리액션 토글
 *
 * @param videoId - 영상 ID
 * @param data - 리액션 데이터
 * @returns 리액션 활성화 여부
 */
export async function toggleVideoReaction(
  videoId: string,
  data: ToggleVideoReactionDto,
): Promise<{ active: boolean }> {
  const response = await apiClient.post<ApiResponse<{ active: boolean }>>(
    `/videos/${videoId}/reactions`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}

/**
 * 영상 타임스탬프 댓글 생성
 *
 * @param videoId - 영상 ID
 * @param data - 댓글 데이터
 * @returns 생성된 댓글
 */
export async function createVideoComment(
  videoId: string,
  data: CreateVideoCommentDto,
): Promise<VideoComment> {
  const response = await apiClient.post<ApiResponse<VideoComment>>(
    `/videos/${videoId}/comments`,
    data,
  );

  if (response.data.resultType === 'SUCCESS') {
    return response.data.success;
  }

  throw new Error(response.data.error.reason);
}
