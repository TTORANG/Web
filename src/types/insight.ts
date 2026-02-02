export type SummaryStat = {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down';
};

export type DropOffSlide = {
  label: string;
  desc: string;
  percent: number;
  slideIndex: number;
};

export type DropOffTime = {
  time: string;
  desc: string;
  count: number;
  slideIndex: number;
};
