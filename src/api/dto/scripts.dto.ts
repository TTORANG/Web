/**
 * 대본 저장 요청 DTO
 */
export interface UpdateScriptDto {
  script: string;
}

/**
 * 대본 복원 요청 DTO
 */
export interface RestoreScriptDto {
  version: number;
}
