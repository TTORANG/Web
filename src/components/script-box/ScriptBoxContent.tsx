import { useState } from 'react';

export default function ScriptBoxContent() {
  const [script, setScript] = useState('');

  return (
    <div className="h-[calc(100%-2.5rem)] overflow-y-auto bg-white px-4 py-3">
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="대본을 입력하세요..."
        aria-label="슬라이드 대본"
        className="h-full w-full resize-none border-none bg-transparent text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-600"
      />
    </div>
  );
}
