/**
 * @file index.ts
 * @description DTO 배럴 export
 */

export type {
  SocialLoginSuccessResponseDto,
  SocialLoginTokensResponseDto,
  SocialLoginUserResponseDto,
} from './auth.dto';
export type {
  CreateSlideResponseDto,
  GetSlideResponseDto,
  UpdateSlideResponseDto,
  UpdateSlideTitleRequestDto,
} from './slides.dto';
export type {
  UpdateScriptRequestDto,
  GetScriptResponseDto,
  GetScriptVersionHistoryResponseDto,
  RestoreScriptResponseDto,
} from './scripts.dto';
export type { ToggleSlideReactionDto } from './reactions.dto';
export type { RestoreScriptRequestDto } from './analytics.dto';
// export type { CreateProjectRequestDto, CreateProjectResponseDto, GetProjectResponseDto, UpdateProjectRequestDto } from './presentations.dto';
// export type { UploadFileResponseDto } from './files.dto';
export type { StartVideoRequest, FinishVideoRequest, FinishVideoResponse } from './video.dto';
export type {
  CommentResponseDto,
  CommentUserDto,
  CommentWithUserDto,
  CreateCommentRequestDto,
  CreateCommentResponseDto,
  CreateReplyCommentRequestDto,
  CreateReplyCommentResponseDto,
  CreateVideoCommentRequestDto,
  DeleteCommentRequestDto,
  GetRepliesResponseDto,
  GetReplyListResponseDto,
  GetSlideCommentsResponseDto,
  UpdateCommentResponseDto,
} from './comments.dto';
