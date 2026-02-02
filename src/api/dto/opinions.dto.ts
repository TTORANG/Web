/**
 * @file opinions.dto.ts
 * @description 의견(댓글) API 요청 DTO
 */

export interface CreateOpinionDto {
  content: string;
  parentId?: string;
}
