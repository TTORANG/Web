/**
 * 프레젠테이션 데이터 모델
 *
 * 프레젠테이션(발표) 하나의 정보를 나타냅니다.
 * 각 프레젠테이션은 페이지 수, 발표 시간, 댓글 및 이모지 반응 수, 조회수를 포함합니다.
 */

export interface CreatePresentationRequest {
  title: string;
  uploadFileId: string;
}

export interface CreatePresentationSuccess {
  message: string;
  projectId: string;
  title: string;
  createdAt: string;
}

export interface Presentation {
  projectId: string;
  title: string;
  thumbnailUrl?: string;
  /**
   * 총 슬라이드 수 (표준 필드)
   * - 새 코드에서는 이 필드를 사용하세요.
   */
  slideCount: number; // Used in develop

  /**
   * 피드백(댓글) 수 (표준 필드)
   * - 새 코드에서는 이 필드를 사용하세요.
   */
  feedbackCount: number; // Used in develop
  /**
   * @deprecated 기존 명칭입니다. 대신 `feedbackCount`를 사용하세요.
   * 구 버전 클라이언트/응답 포맷 호환을 위해 남겨둔 필드입니다.
   */
  commentCount?: number; // Used in HEAD

  /**
   * 이모지/리액션 수
   */
  reactionCount?: number; // Used in HEAD
  /**
   * 조회수
   */
  viewCount?: number; // Used in HEAD

  /**
   * 발표 시간(초 단위, 표준 필드)
   * - 새 코드에서는 이 필드를 기준으로 시간을 계산하세요.
   */
  durationSeconds: number; // Used in develop
  /**
   * @deprecated 기존 분 단위 필드입니다. 대신 `durationSeconds`를 사용해 분 단위로 계산하세요.
   */
  durationMinutes?: number; // Used in HEAD

  userName?: string; // Used in HEAD

  createdAt: string;
  updatedAt: string;
}

/**
 * API 응답 타입: 프로젝트 목록 조회 (페이지네이션)
 */
export interface PresentationListResponse {
  presentations: Presentation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API 응답 타입: 프로젝트 수정 응답
 */
export interface ProjectUpdateResponse {
  projectId: string;
  title: string;
  userName: string;
  updatedAt: string;
}
