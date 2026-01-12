import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api';
import { Dropdown, Modal, Popover, Skeleton, Spinner } from '@/components/common';
import { showToast } from '@/utils/toast';

/**
 * React Query 전역 에러 테스트용 컴포넌트
 * 마운트 시 자동으로 400 에러 발생
 */
function TestQueryError() {
  useQuery({
    queryKey: ['test-error-400'],
    queryFn: () => apiClient.get('/test/error/400'),
    retry: 0,
  });
  return null;
}

/** 400 에러 버튼 클릭용 hook */
function useTrigger400() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['test-error-400'] });
  };
}

export default function DevTestPage() {
  const trigger400 = useTrigger400();
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isLargeModalOpen, setIsLargeModalOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-8">
      <TestQueryError />
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🛠️ 개발 테스트 페이지</h1>
        <Link to="/" className="text-body-s text-main hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>

      {/* Toast 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🎨 Toast 테스트</h2>

        {/* 기본 토스트 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-600">기본 (메시지만)</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => showToast.info('복사가 완료되었습니다.')}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            >
              Info
            </button>
            <button
              onClick={() => showToast.success('저장되었습니다.')}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
            >
              Success
            </button>
            <button
              onClick={() => showToast.warning('주의가 필요합니다.')}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
            >
              Warning
            </button>
            <button
              onClick={() => showToast.error('오류가 발생했습니다.')}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              Error
            </button>
          </div>
        </div>

        {/* Description 포함 토스트 */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-600">설명 포함</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => showToast.info('알림', '새로운 메시지가 도착했습니다.')}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            >
              Info + 설명
            </button>
            <button
              onClick={() =>
                showToast.success('업로드 완료', '파일이 성공적으로 업로드되었습니다.')
              }
              className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
            >
              Success + 설명
            </button>
            <button
              onClick={() => showToast.warning('용량 부족', '저장 공간이 10% 미만입니다.')}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white hover:bg-yellow-600"
            >
              Warning + 설명
            </button>
            <button
              onClick={() => showToast.error('업로드 실패', '파일 크기가 100MB를 초과합니다.')}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              Error + 설명
            </button>
          </div>
        </div>
      </section>

      {/* 에러 핸들링 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🚨 에러 핸들링 테스트</h2>

        <div className="mb-4">
          <h3 className="mb-3 text-sm font-medium text-gray-600">에러 테스트</h3>
          <p className="mb-3 text-xs text-orange-600">⚠️ 400 에러는 페이지 진입 시 자동 발생</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={trigger400}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              400 (React Query)
            </button>
            <button
              onClick={() => apiClient.get('/test/error/401')}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              401 (Axios)
            </button>
            <button
              onClick={() => apiClient.get('/test/error/500')}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              500 (Axios)
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          * 400: 페이지 진입 시 자동 + 버튼 클릭 (React Query) | 401, 500: Axios 인터셉터
        </p>
      </section>

      {/* Skeleton 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">💀 Skeleton 테스트</h2>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2 font-medium text-gray-800">Features</p>
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
              <p className="mb-2 text-xs text-gray-500">Card</p>
              <Skeleton.Card />
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500">ListItem</p>
              <Skeleton.ListItem />
              <Skeleton.ListItem />
            </div>
          </div>
        </div>
      </section>

      {/* Spinner 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🔄 Spinner 테스트</h2>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2 font-medium text-gray-800">Features</p>
          <ul className="list-inside list-disc space-y-1">
            <li>size: 크기 (기본값: 24)</li>
            <li>color: 색상 (기본값: main)</li>
            <li>strokeWidth: 선 두께 (기본값: 2.5)</li>
          </ul>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner size={16} />
            <span className="text-xs text-gray-500">16px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} />
            <span className="text-xs text-gray-500">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={32} />
            <span className="text-xs text-gray-500">32px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} color="var(--color-main)" />
            <span className="text-xs text-gray-500">main</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size={24} color="var(--color-error)" />
            <span className="text-xs text-gray-500">error</span>
          </div>
        </div>
      </section>

      {/* Modal 테스트 */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800">🪟 Modal 테스트</h2>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2 font-medium text-gray-800">Features</p>
          <ul className="list-inside list-disc space-y-1">
            <li>size: sm | md | lg</li>
            <li>title: 선택적 제목</li>
            <li>showCloseButton: 닫기 버튼 표시 여부</li>
            <li>closeOnBackdropClick: 배경 클릭으로 닫기</li>
            <li>closeOnEscape: ESC 키로 닫기</li>
            <li>포커스 트랩 및 body 스크롤 방지</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsBasicModalOpen(true)}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            기본 모달
          </button>
          <button
            onClick={() => setIsTitleModalOpen(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            제목 있는 모달
          </button>
          <button
            onClick={() => setIsLargeModalOpen(true)}
            className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600"
          >
            큰 모달 (lg)
          </button>
        </div>

        {/* 기본 모달 */}
        <Modal isOpen={isBasicModalOpen} onClose={() => setIsBasicModalOpen(false)} size="sm">
          <div className="text-center">
            <p className="text-gray-800">기본 모달입니다.</p>
            <p className="mt-2 text-sm text-gray-500">ESC 키나 배경 클릭으로 닫을 수 있습니다.</p>
          </div>
        </Modal>

        {/* 제목 있는 모달 */}
        <Modal
          isOpen={isTitleModalOpen}
          onClose={() => setIsTitleModalOpen(false)}
          title="발표 자료 공유"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm font-medium text-gray-600">공유 링크</p>
              <p className="mt-1 text-sm text-gray-800">https://ttorang.app/share/abc123</p>
            </div>
            <button
              onClick={() => setIsTitleModalOpen(false)}
              className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </Modal>

        {/* 큰 모달 */}
        <Modal
          isOpen={isLargeModalOpen}
          onClose={() => setIsLargeModalOpen(false)}
          title="큰 모달"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              큰 사이즈의 모달입니다. 더 많은 콘텐츠를 표시할 수 있습니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-sm font-medium">항목 1</p>
              </div>
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-sm font-medium">항목 2</p>
              </div>
            </div>
          </div>
        </Modal>
      </section>

      {/* Popover 테스트 */}
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

      {/* Dropdown 테스트 */}
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

      {/* 컴포넌트 테스트 영역 (확장용) */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-600">📦 컴포넌트 테스트 영역</h2>
        <p className="text-sm text-gray-500">새로운 컴포넌트를 테스트할 때 이 영역에 추가하세요.</p>
      </section>
    </main>
  );
}
