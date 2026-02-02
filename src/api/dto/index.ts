/**
 * @file index.ts
 * @description DTO 배럴 export
 */

export type { CreateProjectDto, UpdateProjectDto } from './projects.dto';
export type { CreateSlideDto, UpdateSlideDto } from './slides.dto';
export type { UpdateScriptDto, RestoreScriptDto } from './scripts.dto';
export type { CreateOpinionDto } from './opinions.dto';
export type { ToggleSlideReactionDto } from './reactions.dto';
export type {
  CreateVideoDto,
  FinishRecordingDto,
  ToggleVideoReactionDto,
  CreateVideoCommentDto,
} from './videos.dto';
