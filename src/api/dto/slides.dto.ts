/**
 * 슬라이드 목록 조회 DTO
 */
export interface CreateSlideResponseDto {
  slideId: string;
  projectId: string;
  title: string;
  slideNum: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 슬라이드 제목 수정 요청 DTO
 */
export interface UpdateSlideTitleRequestDto {
  title?: string;
}

/**
 * 슬라이드 상세 조회 DTO
 */
export interface GetSlideResponseDto {
  slideId: string;
  projectId: string;
  title: string;
  slideNum: number;
  imageUrl: string;
  prevSlideId: string | null;
  nextSlideId: string | null;
  updatedAt: string;
}

/**
 * 슬라이드 수정 응답 DTO
 */
export interface UpdateSlideResponseDto {
  slideId: string;
  title: string;
  slideNum: number;
  imageUrl: string;
  updatedAt: string;
}
