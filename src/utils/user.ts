import type { User } from '@/types/auth';

export function getUserDisplayName(user: User | null | undefined, fallback = '사용자'): string {
  if (!user) return fallback;
  return user.name ?? user.email?.split('@')[0] ?? user.id ?? fallback;
}
