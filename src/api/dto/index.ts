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
export type {
  ReadReactionCountDto,
  ReadVideoReactionSummaryItemDto,
  ReadVideoReactionTimelineResponseDto,
  ReadVideoReactionTimelineMarkerDto,
  ToggleSlideReactionDto,
  ToggleSlideReactionResponseDto,
  ToggleVideoReactionDto,
  ToggleVideoReactionResponseDto,
} from './reactions.dto';
export type { RestoreScriptRequestDto } from './analytics.dto';
export type {
  CreatePresentationRequestDto,
  CreatePresentationResponseDto,
  GetPresentationsRequestDto,
  GetPresentationsResponseDto,
  UpdatePresentationRequestDto,
  DeleteProjectResponseDto,
} from './presentations.dto';
// export type { UploadFileResponseDto } from './files.dto';
export type {
  ChunkUploadResponseDto,
  FinishVideoRequestDto,
  FinishVideoResponseDto,
  GetProjectVideosResponseDto,
  GetVideoDetailResponseDto,
  GetVideoSlidesResponseDto,
  StartVideoRequestDto,
  StartVideoResponseDto,
  VideoDetailDto,
  VideoListItemDto,
  VideoSlideTimelineItemDto,
  VideoStatus,
  VideoTimelineCommentDto,
  VideoTimelineCommentUserDto,
  VideoTimelineDto,
  VideoTimelineReactionDto,
} from './video.dto';
export type {
  CommentUserDto,
  CommentWithUserDto,
  CreateCommentRequestDto,
  CreateCommentResponseDto,
  CreateReplyCommentRequestDto,
  CreateReplyCommentResponseDto,
  CreateVideoCommentRequestDto,
  DeleteCommentRequestDto,
  DeleteCommentResponseDto,
  GetReplyListResponseDto,
  GetSlideCommentsResponseDto,
  UpdateCommentResponseDto,
} from './comments.dto';
