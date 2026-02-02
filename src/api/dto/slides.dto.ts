/**
 * @file slides.dto.ts
 * @description 슬라이드 API 요청 DTO
 */

export interface CreateSlideDto {
  title: string;
  script?: string;
}

export interface UpdateSlideDto {
  title?: string;
  script?: string;
}
