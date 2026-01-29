/**
 * @file ScriptPanel.tsx
 * @description 스크립트를 표시하는 패널 컴포넌트
 */
import SlideTitle from '@/components/slide/script/SlideTitle';

interface ScriptPanelProps {
  script?: string;
  fallbackTitle: string;
  className?: string;
  id?: string;
  ariaLabelledby?: string;
}

export default function ScriptPanel({
  script,
  fallbackTitle,
  className = '',
  id,
  ariaLabelledby,
}: ScriptPanelProps) {
  return (
    <div id={id} role="tabpanel" aria-labelledby={ariaLabelledby} className={className}>
      <SlideTitle fallbackTitle={fallbackTitle} />
      <div className="mt-3 bg-gray-200 rounded-lg px-4 py-3 h-48 overflow-y-auto">
        <p
          className={`text-body-s ${script ? 'text-black' : 'text-gray-600'}`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {script || '대본이 없습니다.'}
        </p>
      </div>
    </div>
  );
}
