/**
 * @file ScriptBoxContent.tsx
 * @description ScriptBox 본문 영역
 *
 * 슬라이드 대본을 입력하는 텍스트 영역입니다.
 * Zustand store를 통해 대본을 읽고 업데이트합니다.
 */
import { useSlideActions, useSlideScript } from '@/hooks';

export default function ScriptBoxContent() {
  const script = useSlideScript();
  const { updateScript, saveToHistory } = useSlideActions();

  return (
    <div className="h-full bg-white px-5 py-3">
      <textarea
        value={script}
        onChange={(e) => updateScript(e.target.value)}
        onBlur={saveToHistory}
        placeholder="슬라이드 대본을 입력하세요..."
        aria-label="슬라이드 대본"
        className="h-full w-full resize-none border-none bg-transparent text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-600 overflow-y-auto"
      />
    </div>
  );
}
