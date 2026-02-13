export type SummaryStat = {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

export type DropOffSlide = {
  label: string;
  desc: string;
  percent: number;
  slideIndex: number;
  count: number;
};

export type DropOffTime = {
  time: string;
  desc: string;
  count: number;
  slideIndex: number;
  seconds: number;
};
