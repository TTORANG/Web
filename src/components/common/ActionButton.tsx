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
      className={`w-full max-w-[440px] py-4 bg-[#5162ff] hover:bg-[#4050ff] disabled:bg-gray-600
      text-white rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]`}
    >
      {text}
    </button>
  );
};
