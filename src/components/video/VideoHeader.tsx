import { Logo } from '@/components/common';

interface VideoHeaderProps {
  title: string;
  step: 'TEST' | 'RECORDING';
  onExit: () => void;
}

export const VideoHeader = ({ title, step, onExit }: VideoHeaderProps) => {
  return (
    <header className="flex h-15 w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#2a2d34] px-6 md:px-18">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden h-4 w-[1px] bg-white/20 sm:block" />
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      <button
        onClick={onExit}
        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white border border-white/10 transition-colors"
      >
        {step === 'RECORDING' ? '녹화 중단' : '종료'}
      </button>
    </header>
  );
};
