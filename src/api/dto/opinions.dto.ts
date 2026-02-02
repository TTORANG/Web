/**
 * 의견(댓글) 생성 요청 DTO
 */
export interface CreateOpinionDto {
  content: string;
  /** 답글인 경우 부모 의견 ID */
  parentId?: string;
}
