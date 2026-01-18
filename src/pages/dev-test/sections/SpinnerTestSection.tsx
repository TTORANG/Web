import { Spinner } from '@/components/common';

export function SpinnerTestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">🔄 Spinner 테스트</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-black">Features</p>
        <ul className="list-inside list-disc space-y-1">
          <li>size: 크기 (기본값: 24)</li>
          <li>color: 색상 (기본값: main)</li>
          <li>strokeWidth: 선 두께 (기본값: 2.5)</li>
        </ul>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={16} />
          <span className="text-xs text-gray-600">16px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={24} />
          <span className="text-xs text-gray-600">24px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} />
          <span className="text-xs text-gray-600">32px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={24} color="var(--color-main)" />
          <span className="text-xs text-gray-600">main</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={24} color="var(--color-error)" />
          <span className="text-xs text-gray-600">error</span>
        </div>
      </div>
    </section>
  );
}
