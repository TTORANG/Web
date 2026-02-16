/**
 * @file ActionButton.tsx
 * @description 하단 영역 주요 액션 버튼
 */
interface ActionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * @description 하단 주요 액션을 위한 공통 버튼 컴포넌트
 */
export const ActionButton = ({ text, onClick, disabled }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[#FFF] w-full max-w-110 py-4 bg-main hover:bg-main-variant2 disabled:bg-gray-600 disabled:text-white
      rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]`}
    >
      {text}
    </button>
  );
};
