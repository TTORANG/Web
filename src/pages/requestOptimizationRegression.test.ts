import { describe, expect, it } from 'vitest';

import recordingSectionSource from '@/components/video/RecordingSection.tsx?raw';
import scriptBulkEditSource from '@/hooks/useScriptBulkEdit.ts?raw';
import feedbackVideoPageSource from '@/pages/FeedbackVideoPage.tsx?raw';
import videoDetailPageSource from '@/pages/VideoDetailPage.tsx?raw';
import feedbackSlideSource from '@/pages/feedback/useFeedbackSlide.ts?raw';
import feedbackVideoSource from '@/pages/feedback/useFeedbackVideo.ts?raw';

describe('API request optimization regression guards', () => {
  it('RecordingSection은 개별 대본 쿼리를 사용하지 않는다', () => {
    expect(recordingSectionSource).not.toMatch(/useScript\(/);
    expect(recordingSectionSource).not.toMatch(/getScript\(/);
  });

  it('VideoDetailPage는 슬라이드별 getScript 병렬 호출을 하지 않는다', () => {
    expect(videoDetailPageSource).not.toMatch(/getScript\(/);
  });

  it('공유 피드백 훅은 useSharedComments를 통해 댓글을 조회한다', () => {
    expect(feedbackVideoSource).toMatch(/useSharedComments\(/);
    expect(feedbackSlideSource).toMatch(/useSharedComments\(/);
    expect(feedbackVideoSource).not.toMatch(/getSharedComments\(/);
    expect(feedbackSlideSource).not.toMatch(/getSharedComments\(/);
  });

  it('대본 일괄 수정 훅은 마운트 시 scripts 자동 재요청을 하지 않는다', () => {
    expect(scriptBulkEditSource).toMatch(/useProjectScripts\([^)]*enabled:\s*false/);
    expect(scriptBulkEditSource).not.toMatch(/refetchProjectScripts/);
  });

  it('공유 비디오 페이지 대본 섹션은 현재 시점 강조 스타일을 기본 규칙으로 사용한다', () => {
    expect(feedbackVideoPageSource).not.toMatch(/variant="inverted"/);
  });
});
