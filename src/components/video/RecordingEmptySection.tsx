import { ActionButton } from '@/components/common';

interface RecordingEmptySectionProps {
  onStart: () => void;
}

/**
 * @description 녹화 전 초기 진입 화면 !!!!임시!!!
 */
export const RecordingEmptySection = ({ onStart }: RecordingEmptySectionProps) => {
  return (
    <div className="w-full max-w-140 bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold mb-2 text-gray-900">녹화된 영상이 없습니다.</h2>
      <p className="text-gray-500 mb-10 text-sm font-medium">발표 연습을 녹화하고 분석해보세요.</p>

      <div className="w-full bg-gray-50 p-6 rounded-lg mb-10 text-left border border-gray-100">
        <ul className="text-xs text-gray-600 space-y-3 leading-relaxed">
          <li className="flex gap-2">
            <span>•</span> 각 슬라이드별 발표 시간을 측정합니다.
          </li>
          <li className="flex gap-2">
            <span>•</span> 웹캠으로 발표 모습을 녹화합니다.
          </li>
          <li className="flex gap-2">
            <span>•</span> 녹화 종료 후 피드백을 받을 수 있습니다.
          </li>
        </ul>
      </div>

      <ActionButton text="영상 녹화하기" onClick={onStart} />
    </div>
  );
};
