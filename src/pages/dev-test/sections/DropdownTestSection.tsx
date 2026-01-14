import { Dropdown } from '@/components/common';
import { showToast } from '@/utils/toast';

export function DropdownTestSection() {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-800">🔽 Dropdown 테스트</h2>

      <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-gray-800">Features</p>
        <ul className="list-inside list-disc space-y-1">
          <li>position: top | bottom</li>
          <li>align: start | end</li>
          <li>variant: default | danger (삭제 등 위험한 작업용)</li>
          <li>키보드 네비게이션 (↑↓ 화살표, Enter)</li>
          <li>ESC 키 또는 외부 클릭으로 닫기</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* 기본 드롭다운 */}
        <Dropdown
          trigger={
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900">
              기본 드롭다운
            </button>
          }
          items={[
            {
              id: 'edit',
              label: '이름 변경',
              onClick: () => showToast.info('이름 변경 클릭'),
            },
            {
              id: 'delete',
              label: '삭제',
              variant: 'danger',
              onClick: () => showToast.error('삭제 클릭'),
            },
          ]}
          position="bottom"
          align="start"
        />

        {/* 위치 변경 드롭다운 */}
        <Dropdown
          trigger={
            <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
              top-end
            </button>
          }
          items={[
            {
              id: 'share',
              label: '공유하기',
              onClick: () => showToast.info('공유하기 클릭'),
            },
            {
              id: 'duplicate',
              label: '복제하기',
              onClick: () => showToast.info('복제하기 클릭'),
            },
            {
              id: 'delete',
              label: '삭제',
              variant: 'danger',
              onClick: () => showToast.error('삭제 클릭'),
            },
          ]}
          position="top"
          align="end"
        />

        {/* 비활성화 항목 포함 */}
        <Dropdown
          trigger={({ isOpen }) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${
                isOpen ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {isOpen ? '열림' : '비활성화 항목'}
            </button>
          )}
          items={[
            {
              id: 'enabled',
              label: '활성화 항목',
              onClick: () => showToast.success('활성화 항목 클릭'),
            },
            {
              id: 'disabled',
              label: '비활성화 항목',
              onClick: () => {},
              disabled: true,
            },
            {
              id: 'delete',
              label: '삭제',
              variant: 'danger',
              onClick: () => showToast.error('삭제 클릭'),
            },
          ]}
          position="bottom"
          align="start"
        />
      </div>
    </section>
  );
}
