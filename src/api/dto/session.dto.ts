/**
 * 익명 세션 발급 관련 DTO
 */
export interface CreateAnonymousSessionResponseDto {
  message: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  expiresAt: string;
}

/**
 * 익명 프로젝트 생성 DTO
 */
export interface CreateAnonymousPresentationRequestDto {
  title: string;
  uploadedFileId: string;
}

/**
 * 익명 프로젝트 응답 DTO
 */
export interface CreateAnonymousPresentationResponseDto {
  projectId: string;
  title: string;
  updatedAt: string;
}

/**
 * 익명 프로젝트 제목 수정 요청 DTO
 */
export interface UpdateAnonymousPresentationRequestDto {
  title: string;
}

/**
 * 익명 프로젝트 제목 수정 응답 DTO
 */
export interface UpdateAnonymousPresentationResponseDto {
  projectId: string;
  title: string;
  updatedAt: string;
}

/**
 * 익명 세션 병합 요청 DTO
 */
export interface MergeSessionRequestDto {
  anonymousSessionId: string;
}

/**
 * 익명 세션 병합 응답 DTO
 */
export interface MergeSessionResponseDto {
  message: string;
  mergedProjectsCount: number;
}
