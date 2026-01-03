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

  /**
   *  핵심 레이아웃 목표
   * 1) 어떤 화면에서도 16:9 슬라이드가 "잘리지 않게" 전체 노출
   * 2) 슬라이드와 ScriptBox의 폭을 항상 동일하게 유지
   * 3) ScriptBox 토글 애니메이션 시, 슬라이드는 살짝만 내려오되(독립 이동)
   *    ScriptBox와 겹치지 않도록 여백을 유지
   *
   * 접근:
   * - 오른쪽 영역을 "세로 기준"으로 최대 폭을 계산해서(= max-width)
   *   작은 화면에서도 슬라이드가 박스에 의해 잘리지 않도록 방어
   * - 슬라이드/ScriptBox를 동일한 max-width 컨테이너로 감싸 폭을 강제 통일
   */
  return (
    <div className="h-full bg-gray-100">
      {/* 변경: 전체 컨텐츠에 위 여백 주기 */}
      <div className="flex h-full gap-8 px-20 py-12 pb-0">
        {/* ================= LEFT ================= */}
        {/*  슬라이드 리스트 영역 */}
        <aside className="w-80 min-w-80 h-full overflow-y-auto">
          <div className="flex flex-col gap-5 pr-10">
            {slides.map((s, idx) => {
              const isActive = s.id === currentSlide.id;

              return (
                <div
                  key={s.id}
                  className={clsx(
                    'flex items-start gap-3 p-2 bg-gray-100',
                    isActive ? 'border-main' : 'border-gray-200',
                  )}
                >
                  <div className="w-6 pt-2 text-right text-sm font-semibold text-gray-700 select-none">
                    {idx + 1}
                  </div>
                  <Link
                    to={`${basePath}/slide/${s.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={clsx(
                      'block w-full h-40  overflow-hidden',
                      'focus:outline-none focus:ring-2 focus:ring-main',
                    )}
                  >
                    <div
                      className={clsx(
                        'h-full w-full transition',
                        isActive ? 'bg-gray-200' : 'bg-gray-200 hover:bg-gray-200',
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= RIGHT ================= */}
        {/* 오른쪽 영역은 슬라이드(16:9) + ScriptBox(동일폭)로 구성 */}
        <main className="flex-1 h-full min-w-0 overflow-hidden">
          <div className="h-full min-h-0 flex flex-col gap-6">
            {/* ================= SLIDE ================= */}
            <section className="flex-1 min-h-0 overflow-hidden pt-2">
              {/* 핵심: 세로 기준으로 max-width 계산
                 - 화면이 작으면(높이가 부족하면) 가로폭을 자동으로 줄여서
                 - 16:9 슬라이드가 항상 "한 장"으로 온전히 노출되게 함 */}
              <div
                className="
          mx-auto w-full px-2
          max-w-[min(2200px,calc((100dvh-3.75rem-20rem-3rem)*16/9))]
        "
              >
                {/* ScriptBox 토글에 반응하는 슬라이드 이동 (독립적으로 '살짝' 내려옴) */}

                <div
                  className="transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateY(${isScriptCollapsed ? 120 : 0}px)`,
                  }}
                >
                  {/* 슬라이드는 컨테이너 폭을 그대로 쓰고 16:9 유지 */}
                  <div className="w-full aspect-video  bg-gray-200 shadow-sm relative">
                    <span className="text-2xl font-bold text-gray-800 absolute top-10 left-8">
                      {currentSlide.title}
                    </span>
                    <span className="text-base text-gray-600 absolute bottom-6 left-8">
                      {currentSlide.content}
                    </span>
                  </div>

                  {/* 슬라이드와 ScriptBox 사이 공백 유지 */}
                  <div className="h-6" />
                </div>
              </div>
            </section>

            {/* ================= SCRIPT BOX ================= */}
            {/* ScriptBox는 슬라이드와 "완전히 동일한 컨테이너 폭"을 사용 */}
            <div className="shrink-0">
              <div
                className="
          mx-auto w-full px-2
          max-w-[min(2200px,calc((100dvh-3.75rem-20rem-3rem)*16/9))]
        "
              >
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
