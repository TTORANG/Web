import type { User } from '@/types/auth';
import type { Comment } from '@/types/comment';
import type { Reaction } from '@/types/script';
import type { SlideDetail } from '@/types/slide';
import type { VideoFeedback, VideoTimestampFeedback } from '@/types/video';

let counter = 0;
const uid = () => String(++counter);

export function createMockUser(overrides?: Partial<User>): User {
  const id = uid();
  return {
    id,
    email: `user${id}@example.com`,
    name: `User ${id}`,
    sessionId: `session-${id}`,
    ...overrides,
  };
}

export function createMockComment(overrides?: Partial<Comment>): Comment {
  const id = uid();
  return {
    commentId: `comment-${id}`,
    userId: `user-${id}`,
    userName: `User ${id}`,
    content: `Test comment ${id}`,
    createdAt: new Date().toISOString(),
    isMine: false,
    ...overrides,
  };
}

export function createMockReactions(): Reaction[] {
  return [
    { type: 'fire', count: 0, active: false },
    { type: 'sleepy', count: 0, active: false },
    { type: 'good', count: 0, active: false },
    { type: 'bad', count: 0, active: false },
    { type: 'confused', count: 0, active: false },
  ];
}

export function createMockSlide(overrides?: Partial<SlideDetail>): SlideDetail {
  const id = uid();
  return {
    slideId: `slide-${id}`,
    projectId: `project-${id}`,
    title: `Slide ${id}`,
    slideNum: 1,
    imageUrl: `https://example.com/slide-${id}.png`,
    script: `Script for slide ${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    emojiReactions: createMockReactions(),
    ...overrides,
  };
}

export function createMockVideoFeedback(overrides?: Partial<VideoFeedback>): VideoFeedback {
  const id = uid();
  return {
    videoId: `video-${id}`,
    videoUrl: `https://example.com/video-${id}.webm`,
    title: `Video ${id}`,
    duration: 120,
    feedbacks: [],
    comments: [],
    reactionEvents: [],
    ...overrides,
  };
}

export function createMockTimestampFeedback(
  overrides?: Partial<VideoTimestampFeedback>,
): VideoTimestampFeedback {
  return {
    timestampMs: 5000,
    comments: [],
    reactions: createMockReactions(),
    ...overrides,
  };
}

export function resetFixtureCounter() {
  counter = 0;
}
