import { useState } from 'react';

export default function ScriptBoxContent() {
  const [script, setScript] = useState('');

  return (
    // ScriptBox 전체 높이에서 헤더만큼 뺀 영역을 그대로 사용
    <div className="h-full overflow-y-auto bg-white px-4 py-3">
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="슬라이드 대본을 입력하세요..."
        aria-label="슬라이드 대본"
        className="h-full w-full resize-none border-none bg-transparent text-base leading-relaxed text-gray-800 outline-none placeholder:text-gray-600"
      />
    </div>
  );
}
