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
