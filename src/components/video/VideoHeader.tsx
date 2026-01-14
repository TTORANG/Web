import { Logo } from '@/components/common';

interface VideoHeaderProps {
  title: string;
  step?: 'TEST' | 'RECORDING';
  isFeedback?: boolean;
  onExit?: () => void;
}

export const VideoHeader = ({ title, step, isFeedback = false, onExit }: VideoHeaderProps) => {
  return (
    <header className="flex h-15 w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#2a2d34] px-6 md:px-18">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden h-4 w-[1px] bg-white/20 sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-white">{title}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/40 cursor-help"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
      </div>

      {!isFeedback && onExit && (
        <button
          onClick={onExit}
          className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-white border border-white/10 transition-colors"
        >
          {step === 'RECORDING' ? '녹화 중단' : '종료'}
        </button>
      )}
    </header>
  );
};
