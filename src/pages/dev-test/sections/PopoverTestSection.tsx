import { Popover } from '@/components/common';

export function PopoverTestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-800">💬 Popover 테스트</h2>

      <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-gray-800">Features</p>
        <ul className="list-inside list-disc space-y-1">
          <li>position: top | bottom</li>
          <li>align: start | end</li>
          <li>ESC 키 또는 외부 클릭으로 닫기</li>
          <li>children render prop으로 close 함수 전달</li>
          <li>trigger render prop으로 isOpen 상태 전달</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* bottom-start */}
        <Popover
          trigger={
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900">
              bottom-start
            </button>
          }
          position="bottom"
          align="start"
        >
          <div className="w-48 p-4">
            <p className="text-sm text-gray-800">position: bottom</p>
            <p className="text-sm text-gray-800">align: start</p>
          </div>
        </Popover>

        {/* bottom-end */}
        <Popover
          trigger={
            <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
              bottom-end
            </button>
          }
          position="bottom"
          align="end"
        >
          <div className="w-48 p-4">
            <p className="text-sm text-gray-800">position: bottom</p>
            <p className="text-sm text-gray-800">align: end</p>
          </div>
        </Popover>

        {/* top-start */}
        <Popover
          trigger={
            <button className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600">
              top-start
            </button>
          }
          position="top"
          align="start"
        >
          <div className="w-48 p-4">
            <p className="text-sm text-gray-800">position: top</p>
            <p className="text-sm text-gray-800">align: start</p>
          </div>
        </Popover>

        {/* top-end */}
        <Popover
          trigger={
            <button className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600">
              top-end
            </button>
          }
          position="top"
          align="end"
        >
          {({ close }) => (
            <div className="w-48 p-4">
              <p className="mb-2 text-sm text-gray-800">닫기 버튼 포함</p>
              <button
                onClick={close}
                className="rounded bg-gray-200 px-3 py-1 text-xs hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          )}
        </Popover>
      </div>
    </section>
  );
}
