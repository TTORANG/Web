import type {
  ReadPresentationAnalyticsSummaryDto,
  ReadSlideAnalyticsResponseDto,
  ReadVideoExitAnalyticsResponseDto,
} from '@/api/dto/analytics.dto';

import { MOCK_SLIDES } from './slides';

export const getMockPresentationAnalyticsSummary = (
  projectId: string,
): ReadPresentationAnalyticsSummaryDto => {
  void projectId;
  return {
    videoIds: ['1', '2'], // Mock video IDs
    totalViews: 1250,
    avgDurationSeconds: 450,
    completionRate: 0.78,
    totalFeedbackCount: 156,
  };
};

export const getMockSlideAnalytics = (projectId: string): ReadSlideAnalyticsResponseDto => {
  // Filter slides for the project or use default mock slides if none match
  const projectSlides = MOCK_SLIDES.filter((s) => s.projectId === projectId);
  const slidesToUse = projectSlides.length > 0 ? projectSlides : MOCK_SLIDES.slice(0, 5);

  return {
    slides: slidesToUse.map((slide, index) => ({
      slideId: slide.slideId,
      slideNum: index + 1,
      title: slide.title || `슬라이드 ${index + 1}`,
      viewCount: Math.floor(Math.random() * 1000) + 100,
      exitCount: Math.floor(Math.random() * 50),
      exitRate: Math.random() * 0.3,
      reactionCount: (slide.emojiReactions || []).reduce((acc, r) => acc + r.count, 0),
      commentCount: (slide.comments || []).length,
      feedbackCount:
        (slide.emojiReactions || []).reduce((acc, r) => acc + r.count, 0) +
        (slide.comments || []).length,
    })),
  };
};

export const getMockVideoExitAnalytics = (videoId: string): ReadVideoExitAnalyticsResponseDto => {
  void videoId;
  // Generate some exit points every 30 seconds
  const exits = [];
  const durationMs = 300 * 1000; // 5 minutes
  const intervalMs = 30000; // 30 seconds

  for (let time = 0; time <= durationMs; time += intervalMs) {
    exits.push({
      timestampMs: time,
      exitCount: Math.floor(Math.random() * 10),
      exitRate: Math.random() * 0.1,
    });
  }

  return {
    exits,
  };
};
