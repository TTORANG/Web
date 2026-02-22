import { describe, expect, it } from 'vitest';

import demoFeedbackPageSource from '@/pages/DemoFeedbackPage.tsx?raw';

describe('Demo feedback page local-state regression', () => {
  it('does not import API endpoints or query hooks', () => {
    expect(demoFeedbackPageSource).not.toMatch(/api\/endpoints/);
    expect(demoFeedbackPageSource).not.toMatch(/useSharedComments\(/);
    expect(demoFeedbackPageSource).not.toMatch(/useVideoComments\(/);
    expect(demoFeedbackPageSource).not.toMatch(/useVideoReactions\(/);
    expect(demoFeedbackPageSource).not.toMatch(/recordVideoEvent\(/);
  });
});
