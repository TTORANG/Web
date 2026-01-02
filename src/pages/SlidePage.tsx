import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import clsx from 'clsx';

import { ScriptBox } from '@/components/script-box';
import { setLastSlideId } from '@/constants/navigation';

export default function SlidePage() {
  // url에 입력된 프로젝트, 슬라이드id 읽기
  const { projectId, slideId } = useParams<{
    projectId: string;
    slideId: string;
  }>();

  /**
   *
   * 목적:
   * - 탭 이동(영상/인사이트 → 슬라이드) 후 다시 돌아왔을 때
   *   → 마지막으로 보던 슬라이드로 복원하기 위함
   */
  useEffect(() => {
    if (projectId && slideId) {
      setLastSlideId(projectId, slideId);
    }
  }, [projectId, slideId]);

  /**
   * ScriptBox가 접혔는지 여부
   * - ScriptBox 내부 상태를 부모(SlidePage)에서 받아서
   * - 슬라이드 영역을 독립적으로 이동시키는 데 사용
   */
  const [isScriptCollapsed, setIsScriptCollapsed] = useState(false);

  /**
   * 임시 슬라이드 데이터
   * - slideId 기준으로 현재 슬라이드 결정
   * - 왼쪽 썸네일 리스트 및 중앙 슬라이드에 사용
   * - 추후 서버에서 받아온 데이터로 대체
   */
  const slides = [
    {
      id: '1',
      title: '도입',
      thumb: 'https://via.placeholder.com/160x90?text=1',
      content: '이번 프로젝트에서 다루고자 하는 주제와 전체 발표 흐름을 간단히 소개합니다.',
    },
    {
      id: '2',
      title: '문제 정의',
      thumb: 'https://via.placeholder.com/160x90?text=2',
      content: '현재 사용자가 겪고 있는 불편함과 기존 방식의 한계를 정리합니다.',
    },
    {
      id: '3',
      title: '문제 분석',
      thumb: 'https://via.placeholder.com/160x90?text=3',
      content: '문제가 발생하는 원인을 기능·구조·사용 흐름 관점에서 분석합니다.',
    },
    {
      id: '4',
      title: '해결 목표',
      thumb: 'https://via.placeholder.com/160x90?text=4',
      content: '이번 개선을 통해 달성하고자 하는 핵심 목표와 방향성을 정의합니다.',
    },
    {
      id: '5',
      title: '해결 방안',
      thumb: 'https://via.placeholder.com/160x90?text=5',
      content: '문제 해결을 위해 제안하는 주요 기능과 UI/UX 전략을 설명합니다.',
    },
    {
      id: '6',
      title: '기능 구성',
      thumb: 'https://via.placeholder.com/160x90?text=6',
      content: '슬라이드, 스크립트 박스 등 핵심 기능들의 구성과 역할을 소개합니다.',
    },
    {
      id: '7',
      title: '화면 흐름',
      thumb: 'https://via.placeholder.com/160x90?text=7',
      content: '사용자가 화면을 어떻게 탐색하고 상호작용하는지 흐름 중심으로 설명합니다.',
    },
    {
      id: '8',
      title: '기술적 구현',
      thumb: 'https://via.placeholder.com/160x90?text=8',
      content: '레이아웃 분리, 상태 관리 등 구현 과정에서의 핵심 기술적 포인트를 다룹니다.',
    },
    {
      id: '9',
      title: '기대 효과',
      thumb: 'https://via.placeholder.com/160x90?text=9',
      content: '이번 개선으로 사용자 경험과 개발 구조 측면에서 기대되는 효과를 정리합니다.',
    },
    {
      id: '10',
      title: '결론',
      thumb: 'https://via.placeholder.com/160x90?text=10',
      content: '전체 내용을 요약하고, 향후 확장 또는 개선 방향을 제안하며 마무리합니다.',
    },
  ];

  // 현재 선택 중인 슬라이드 중앙 배치
  const currentSlide = slides.find((s) => s.id === slideId) ?? slides[0];
  const basePath = projectId ? `/${projectId}` : '';

  return (
    <div className="h-full bg-gray-100">
      {/*  양쪽 다 바닥까지 꽉: h-full */}
      <div className="flex h-full gap-8 px-20 py-0">
        {/* ================= LEFT ================= */}
        {/* 슬라이드 썸네일 영역
            - 여기만 스크롤 가능
            - 슬라이드 이동은 URL 기반으로 처리 */}
        <aside className="w-80 min-w-80 h-full overflow-y-auto">
          <div className="flex flex-col gap-5 pr-10">
            {slides.map((s, idx) => {
              const isActive = s.id === currentSlide.id;

              return (
                <div
                  key={s.id}
                  className={clsx(
                    'flex items-start gap-3 rounded-xl border p-2 bg-white',
                    isActive ? 'border-main' : 'border-gray-200',
                  )}
                >
                  <div className="w-6 pt-2 text-right text-sm font-semibold text-gray-700 select-none">
                    {idx + 1}
                  </div>
                  {/* 슬라이드 이동 링크 */}
                  <Link
                    to={`${basePath}/slide/${s.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={clsx(
                      'block w-full h-40 rounded-lg overflow-hidden',
                      'focus:outline-none focus:ring-2 focus:ring-main',
                    )}
                  >
                    <div
                      className={clsx(
                        'h-full w-full rounded-lg transition',
                        isActive ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200',
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= RIGHT ================= */}
        {/* 핵심 영역:
            - 슬라이드와 ScriptBox를 완전히 분리된 레이어로 구성
            - ScriptBox는 항상 하단 고정
            - 슬라이드는 ScriptBox 상태에 따라 독립적으로 이동 */}
        <main className="flex-1 h-full overflow-hidden">
          <div className="relative h-full">
            {/* 슬라이드 레이어
                - absolute로 전체 영역을 덮음
                - ScriptBox 높이만큼 paddingBottom으로 안전 영역 확보 */}
            <div
              className="absolute left-0 right-0 top-0 bottom-0 flex justify-center"
              style={{
                paddingBottom: isScriptCollapsed ? 40 : 100,

                paddingTop: 50,
              }}
            >
              {/* 슬라이드 컨테이너
                  - ScriptBox 접힘 상태에 따라 translateY로 "조금만" 이동
                  - 레이아웃 계산이 아닌 명시적 이동을 사용 */}
              <div
                className="w-[2200px] flex flex-col items-center"
                style={{
                  // ✅ 여기서 '독립적으로' 내려가게 만듦 (원하는 만큼만)
                  transform: `translateY(${isScriptCollapsed ? 120 : 0}px)`,
                  transition: 'transform 300ms ease-out',
                }}
              >
                {/* 실제 슬라이드 */}
                <div className="w-[2200px] h-[1238px] rounded-2xl bg-gray-200 shadow-sm relative">
                  <span className="text-2xl font-bold text-gray-800 absolute top-10 left-8">
                    {currentSlide.title}
                  </span>
                  <span className="text-base text-gray-600 absolute bottom-6 left-8">
                    {currentSlide.content}
                  </span>
                </div>
              </div>
            </div>

            {/* ScriptBox 레이어
                - 오른쪽 컬럼 기준 absolute bottom 고정
                - 슬라이드와 동일한 폭을 사용 */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <div className="w-[2200px]">
                <ScriptBox
                  slideTitle={`슬라이드 ${slideId ?? currentSlide.id}`}
                  onCollapsedChange={setIsScriptCollapsed}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
