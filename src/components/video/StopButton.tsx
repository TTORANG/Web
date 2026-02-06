import IconStop from '@/assets/icons/icon-stop.svg?react';

interface StopButtonProps {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}

export default function StopButton({ label = '종료', disabled = false, onClick }: StopButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-full bg-gray-400 py-1.5 pl-3 pr-2 transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="text-caption-bold text-black">{label}</span>
      <IconStop className="h-4 w-4 text-black" />
    </button>
  );
}
