/**
 * 영상 타임스탬프 댓글 생성
 */
export interface CreateOpinionDto {
  content: string;
  /** 답글인 경우 부모 의견 내용 고쳐라이D */
  parentId?: string;
}

/**
 * 영상 녹화 관련 DTO 정의
 */
export interface StartVideoRequest {
  projectId: number;
  title: string;
}

export interface StartVideoResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    videoId: number;
  };
}

export interface FinishVideoRequest {
  slideLogs: Array<{
    slideId: number;
    timestampMs: number;
  }>;
}

export interface FinishVideoResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    videoId: string;
    status: string;
    slideCount: number;
    slideDurations: Array<{
      slideId: string;
      totalDurationMs: number;
    }>;
  };
}

export interface ChunkUploadResponse {
  resultType: 'SUCCESS' | 'FAILURE';
  error: null | {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: {
    ok: boolean;
  };
}
