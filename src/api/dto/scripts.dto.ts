/**
 * @file scripts.dto.ts
 * @description 대본 API 요청 DTO
 */

export interface UpdateScriptDto {
  script: string;
}

export interface RestoreScriptDto {
  version: number;
}
