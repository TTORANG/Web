import posthog from 'posthog-js';

import type { User } from '@/types';

const POSTHOG_PROJECT_KEY = 'phc_gOM0XCnEFz0tHv6ZacyEbqkhRCfl1n23mMMXx4zQUYT';
const POSTHOG_API_HOST = 'https://us.i.posthog.com';
const POSTHOG_DEFAULTS = '2026-01-30';

let isPosthogInitialized = false;

export function initPosthog(): void {
  if (isPosthogInitialized) return;

  posthog.init(POSTHOG_PROJECT_KEY, {
    api_host: POSTHOG_API_HOST,
    defaults: POSTHOG_DEFAULTS,
  });

  isPosthogInitialized = true;
}

export function identifyPosthogUser(user: User): void {
  if (!isPosthogInitialized || !user.id) return;
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    provider: user.provider,
  });
}

export function resetPosthogUser(): void {
  if (!isPosthogInitialized) return;
  posthog.reset();
}
