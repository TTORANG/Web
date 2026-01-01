export interface HistoryItem {
  id: string;
  timestamp: string;
  content: string;
}

export interface OpinionItem {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  isMine: boolean;
  isReply?: boolean;
  parentId?: number;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
}
