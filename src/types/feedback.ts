// types/feedback.ts
export interface Comment {
  id: number;
  user: string;
  time: string;
  slideRef?: string;
  content: string;
  replies?: Comment[];
}

export interface Reaction {
  emoji: string;
  label: string;
  count: number;
  active: boolean;
}

export interface Slide {
  title: string;
  body: string;
  viewerText: string;
}
