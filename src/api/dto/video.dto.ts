/**
 * 영상 녹화 시작 요청 DTO
 */
export interface StartVideoRequestDto {
  projectId: number;
  title: string;
}

/**
 * 영상 녹화 시작 응답 DTO (success 데이터)
 */
export interface StartVideoResponseDto {
  videoId: number;
}

/**
 * 영상 녹화 완료 요청 DTO
 */
export interface FinishVideoRequestDto {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

/**
 * 영상 녹화 완료 응답 DTO (success 데이터)
 */
export interface FinishVideoResponseDto {
  videoId: string;
  status: string;
  slideCount: number;
  slideDurations: Array<{
    slideId: string;
    totalDurationMs: number;
  }>;
}

/**
 * 청크 업로드 응답 DTO (success 데이터)
 */
export interface ChunkUploadResponseDto {
  ok: boolean;
}
