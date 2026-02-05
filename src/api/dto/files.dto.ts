/**
 * 파일 업로드 관련 DTO
 */

/**
 * 파일 업로드 요청 DTO
 */
export interface UploadFileRequestDto {
  file: File;
  title: string;
}
/**
 * 파일 업로드 응답 DTO
 */
export interface UploadFileResponseDto {
  projectId: string;
}
