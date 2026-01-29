/**
 * @file FeedbackTab.tsx
 * @description 피드백 페이지의 탭 버튼 컴포넌트
 */

interface FeedbackTabProps {
  id: string;
  isActive: boolean;
  ariaControls: string;
  onClick: () => void;
  children: React.ReactNode;
}

export default function FeedbackTab({
  id,
  isActive,
  ariaControls,
  onClick,
  children,
}: FeedbackTabProps) {
  return (
    <button
      role="tab"
      id={id}
      aria-selected={isActive}
      aria-controls={ariaControls}
      onClick={onClick}
      className={`flex-1 py-3 text-body-m-bold transition-colors ${
        isActive ? 'text-main border-b border-main-variant1' : 'text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
