import { Skeleton } from '@/components/common';

export function SkeletonTestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">💀 Skeleton 테스트</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-black">Features</p>
        <ul className="list-inside list-disc space-y-1">
          <li>width, height: 크기 (숫자면 px, 문자열이면 그대로)</li>
          <li>rounded: 모서리 둥글기</li>
          <li>Skeleton.Circle: 원형 (아바타용)</li>
          <li>Skeleton.Text: 여러 줄 텍스트</li>
          <li>Skeleton.Card / Skeleton.ListItem: 프리셋</li>
        </ul>
      </div>

      {/* 기본 스켈레톤 */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600">기본 스켈레톤</h3>
        <div className="flex flex-col gap-2">
          <Skeleton width="100%" height={20} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={20} />
        </div>
      </div>

      {/* 원형 스켈레톤 */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600">원형 (Circle)</h3>
        <div className="flex gap-3">
          <Skeleton.Circle size={32} />
          <Skeleton.Circle size={48} />
          <Skeleton.Circle size={64} />
        </div>
      </div>

      {/* 텍스트 스켈레톤 */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-600">텍스트 (Text)</h3>
        <Skeleton.Text lines={3} />
      </div>

      {/* 프리셋 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-600">프리셋</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs text-gray-600">Card</p>
            <Skeleton.Card />
          </div>
          <div>
            <p className="mb-2 text-xs text-gray-600">ListItem</p>
            <Skeleton.ListItem />
            <Skeleton.ListItem />
          </div>
        </div>
      </div>
    </section>
  );
}
