import { Logo } from '../common/Logo';

interface RecordingHeaderProps {
  title: string;
  onExit?: () => void;
}

/**
 * @description 비디오 녹화 및 테스트 화면 전용 헤더
 */
export const RecordingHeader = ({ title, onExit }: RecordingHeaderProps) => {
  return (
    <header className="h-16 px-6 flex items-center justify-between bg-[#2a2d34] border-b border-white/5">
      <div className="flex items-center gap-4">
        <Logo />

        <div className="w-px h-4 bg-white/20" />

        <span className="font-medium text-sm text-white/90">{title}</span>
      </div>

      {onExit && (
        <button
          onClick={onExit}
          className="group px-4 py-1.5 bg-[#4a4d55] hover:bg-[#ff4d4d] transition-colors rounded text-xs text-white flex items-center gap-2"
        >
          종료
          <div className="w-2.5 h-2.5 bg-white rounded-sm group-hover:scale-110 transition-transform" />
        </button>
      )}
    </header>
  );
};
