import IconVideo from '@/assets/icons/icon-video.svg?react';

interface RecordingEmptySectionProps {
  onStart: () => void;
}

/**
 * @description PD_VID_01_C01
 */
export const RecordingEmptySection = ({ onStart }: RecordingEmptySectionProps) => {
  return (
    <div className="flex w-160 flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
      {/* 상단 콘텐츠 */}
      <div className="flex flex-col items-center gap-8 pt-6">
        {/* 아이콘 + 텍스트 */}
        <div className="flex flex-col items-center gap-4">
          {/* 아이콘 */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <IconVideo className="h-6 w-6 text-gray-600" />
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-title-s-bold text-gray-800">녹화된 영상이 없습니다.</h2>
            <p className="text-body-m text-gray-600">발표 연습을 녹화하고 분석해보세요</p>
          </div>
        </div>

        {/* 설명 박스 */}
        <div className="flex w-full flex-col gap-1 rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex items-start gap-4">
            <span className="shrink-0 text-body-m-bold text-gray-600">녹화를 시작하면 :</span>
            <div className="flex flex-col gap-1 text-body-m text-gray-800">
              <p>각 슬라이드별 발표 시간을 측정합니다.</p>
              <p>웹캠으로 발표 모습을 녹화합니다.</p>
              <p>나중에 피드백을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <button
        onClick={onStart}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-main text-body-m-bold text-white transition-colors hover:bg-main-variant2"
      >
        <span>영상 녹화하기</span>
        <IconVideo className="h-4 w-4" />
      </button>
    </div>
  );
};
