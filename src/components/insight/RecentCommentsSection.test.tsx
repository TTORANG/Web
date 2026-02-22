import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ReadRecentCommentListResponseDto } from '@/api/dto/analytics.dto';

import { RecentCommentsSection } from './RecentCommentsSection';

describe('RecentCommentsSection', () => {
  it('uses profileImageUrl fallback when profileImage is missing', () => {
    const recentCommentsData: ReadRecentCommentListResponseDto = {
      comments: [
        {
          commentId: 'comment-1',
          content: '좋은 발표였어요.',
          timestampMs: 42000,
          createdAt: '2026-02-01T00:00:00.000Z',
          user: {
            userId: 'user-1',
            nickName: 'alex',
            name: 'Alex',
            profileImageUrl: 'https://example.com/avatar.png',
          },
          slide: {
            slideId: 'slide-1',
            slideNum: 1,
            title: '첫 번째 슬라이드',
            imageUrl: 'https://example.com/slide-1.png',
          },
        },
      ],
    };

    render(<RecentCommentsSection hasVideo recentCommentsData={recentCommentsData} />);

    expect(screen.getByRole('img', { name: 'Alex' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png',
    );
  });
});
