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

export interface CreateUploadUrlRequestDto {
  purpose: 'presentation_file';
  contentType: string;
  size: number;
  originalFilename: string;
  title?: string;
}

export interface CreateUploadUrlResponseDto {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
  uploadToken: string;
}

export interface CompleteUploadRequestDto {
  objectKey: string;
  uploadToken: string;
}
/**
 * 파일 업로드 응답 DTO
 */
export interface UploadFileResponseDto {
  projectId: string;
}

export type CompleteUploadResponseDto = UploadFileResponseDto;
