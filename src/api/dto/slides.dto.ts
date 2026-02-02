/**
 * 슬라이드 제목 수정 요청 DTO
 */
export interface UpdateSlideDto {
  title?: string;
}

/**
 * 슬라이드 생성 요청 DTO
 */
export interface CreateSlideDto {
  title: string;
  script?: string;
}
