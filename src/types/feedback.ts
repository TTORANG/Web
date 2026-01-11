// types/feedback.ts
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
