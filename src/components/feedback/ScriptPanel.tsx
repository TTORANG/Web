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
      <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-200 px-4 py-3 h-48 overflow-y-auto pb-4">
        <p
          className={`text-body-s leading-relaxed wrap-break-word ${script ? 'text-black' : 'text-gray-600'}`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {script || '대본이 없습니다.'}
        </p>
      </div>
    </div>
  );
}
