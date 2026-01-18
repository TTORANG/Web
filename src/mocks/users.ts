import type { User } from '@/types/auth';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: '김또랑',
    email: 'andy@ttorang.io',
    provider: 'google',
    profileImage: 'https://api.dicebear.com/9.x/notionists/svg?seed=me',
  },
  {
    id: 'user-2',
    name: '춘식이',
    email: 'slide@ttorang.io',
    provider: 'kakao',
    profileImage: 'https://api.dicebear.com/9.x/notionists/svg?seed=choonsik',
  },
  {
    id: 'user-3',
    name: '라이언',
    email: 'feedback@ttorang.io',
    provider: 'naver',
    profileImage: 'https://api.dicebear.com/9.x/notionists/svg?seed=ryan',
  },
  {
    id: 'user-4',
    name: '어피치',
    email: 'dev@ttorang.io',
    provider: 'google',
    profileImage: 'https://api.dicebear.com/9.x/notionists/svg?seed=apeach',
  },
  {
    id: 'user-5',
    name: '가나디',
    email: 'design@ttorang.io',
    provider: 'google',
    profileImage: 'https://api.dicebear.com/9.x/notionists/svg?seed=ganadi',
  },
];

export const MOCK_CURRENT_USER = MOCK_USERS[0];
