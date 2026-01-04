import type { EmojiReaction, HistoryItem, OpinionItem } from './script';

export interface Slide {
  id: string;
  title: string;
  thumb: string;
  content: string;
  script: string;
  opinions: OpinionItem[];
  history: HistoryItem[];
  emojiReactions: EmojiReaction[];
}
