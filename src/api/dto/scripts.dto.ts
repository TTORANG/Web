/**
 * 대본 저장 및 수정 DTO
 */
export interface UpdateScriptRequestDto {
  script: string;
}
/**
 * 대본 조회 DTO
 */
export interface GetScriptResponseDto {
  message: string;
  slideId: string;
  charCount: number;
  scriptText: string;
  estimatedDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}
/**
 * 대본 버전 히스토리 목록 조회 DTO
 */
export interface GetScriptVersionHistoryResponseDto {
  versionNumber: number;
  scriptText: string;
  charCount: number;
  createdAt: string;
}
/**
 * 특정 버전으로 대본 복원 DTO
 */
export interface RestoreScriptResponseDto {
  message: string;
  slideId: string;
  charCount: number;
  scriptText: string;
  estimatedDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 프로젝트 대본 항목 DTO
 */
export interface ProjectScriptItemDto {
  slideId: string;
  title?: string | null;
  scriptText: string;
}

/**
 * 프로젝트 전체 대본 조회 응답 DTO
 */
export interface GetProjectScriptsResponseDto {
  message: string;
  projectId: string;
  scripts: ProjectScriptItemDto[];
}

/**
 * 프로젝트 대본 일괄 수정 요청 DTO
 */
export interface BulkEditScriptsRequestDto {
  scripts: ProjectScriptItemDto[];
}

/**
 * 프로젝트 대본 일괄 수정 응답 DTO
 */
export interface BulkEditScriptsResponseDto {
  message: string;
  projectId: string;
  requestedSlideCount: number;
  updatedSlideCount: number;
  unchangedSlideCount: number;
  updatedSlideIds: string[];
}
