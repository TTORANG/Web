// API
export type { ApiErrorResponse, ApiResponse, PaginatedData } from './api';

// Auth
export type { AuthProvider, User } from './auth';

// Comment
export type { Comment } from './comment';

// Home
export type { SortMode, ViewMode, FilterMode } from './home';

// Navigation
export type { TabItem, TabKey } from './navigation';

// Presentation
export type { Presentation } from './presentation';

// Script
export type { Reaction, ReactionType } from './script';

// Share
export type {
  ShareScope,
  ShareableVideo,
  ShareableVideosPagination,
  ShareableVideosData,
  ShareableVideosResponse,
  CreateShareLinkRequest,
  SharedContentSummary,
  CreateShareLinkData,
  CreateShareLinkResponse,
  SharedPresentationSlide,
  SharedPresentationVideo,
  SharedPresentationComment,
  SharedPresentationCommentTargetType,
  ReadSharedContentData,
  ReadSharedContentResponse,
  ReadSharedCommentsData,
  ReadSharedCommentsResponse,
} from './share';

// Slide
export type { SlideDetail, SlideListItem } from './slide';

// Theme
export type { ThemeMode } from './theme';

// Upload _
//export type { UploadState } from './uploadFile';
export type { UploadStep } from './uploadFile';
