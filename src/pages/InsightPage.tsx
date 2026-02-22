// src/pages/insight/InsightPage.tsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import clsx from 'clsx';

import { Dropdown, Skeleton } from '@/components/common';
import type { DropdownItem } from '@/components/common/Dropdown';
import { SummaryStatsSection } from '@/components/insight';
import { DropOffAnalysisSection } from '@/components/insight';
import { FeedbackDistributionSection } from '@/components/insight';
import { TopSlideCard } from '@/components/insight';
import { RecentCommentsSection } from '@/components/insight/RecentCommentsSection';
import { RetentionChartCard } from '@/components/insight/charts/RetentionChartCard';
import { DEMO_SHARE_PATH, isDemoProject } from '@/constants/demoProject';
import { getTabPath } from '@/constants/navigation';
import { createDefaultReactions } from '@/constants/reaction';
import { useInsightPageModel } from '@/hooks/useInsightPageModel';

function InsightPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-18 md:py-8">
      <div className="flex flex-col gap-2">
        <Skeleton width={140} height={20} />
        <Skeleton width={220} height={14} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {['summary-1', 'summary-2', 'summary-3', 'summary-4'].map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4"
            >
              <Skeleton width="50%" height={14} />
              <Skeleton width="40%" height={22} />
              <Skeleton width="60%" height={12} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          {['dropoff-1', 'dropoff-2'].map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="flex min-w-0 flex-1 basis-full flex-col gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 lg:basis-160"
            >
              <Skeleton width="40%" height={18} />
              {['row-1', 'row-2', 'row-3'].map((rowKey) => (
                <div key={rowKey} className="flex items-center gap-4">
                  <Skeleton width={120} height={68} rounded={8} />
                  <div className="flex-1">
                    <Skeleton width="60%" height={14} className="mb-2" />
                    <Skeleton width="40%" height={12} />
                  </div>
                  <Skeleton width={48} height={18} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
          <Skeleton width="45%" height={18} className="mb-4" />
          <Skeleton width="100%" height={200} rounded={8} />
        </div>

        <div className="grid grid-cols-1 gap-12 py-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
            <Skeleton width="40%" height={18} className="mb-4" />
            <Skeleton width="100%" height={180} rounded={8} />
          </div>

          <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
            <Skeleton width="60%" height={18} />
            <div className="flex flex-wrap items-start gap-4">
              {['top-slide-1', 'top-slide-2', 'top-slide-3'].map((skeletonKey) => (
                <Skeleton.Card key={skeletonKey} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
          <Skeleton width="30%" height={18} className="mb-4" />
          <div className="flex flex-col gap-3">
            {['comment-1', 'comment-2', 'comment-3'].map((skeletonKey) => (
              <Skeleton.ListItem key={skeletonKey} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsightPage() {
  const navigate = useNavigate();
  const m = useInsightPageModel();
  const { selectedVideoId, projectIdStr, getSeekSecondsForSlide, getSlideIdByIndex } = m;
  const selectedDataSourceOption = m.dataSourceOptions.find(
    (option) => option.key === m.selectedDataSourceKey,
  );

  const canSeekToSelectedVideo = Boolean(selectedVideoId && m.isVideoSource);

  const dataSourceItems: DropdownItem[] = m.dataSourceOptions.map((option) => {
    const isSelectedItem = option.key === m.selectedDataSourceKey;
    const subLabelClassName = clsx(
      'mt-0.5 block truncate text-caption',
      isSelectedItem ? 'text-white/90' : 'text-gray-600',
    );

    return {
      id: option.key,
      label:
        option.kind === 'video' ? (
          <div className="flex min-w-0 items-center gap-3">
            {option.thumbnailUrl ? (
              <img
                src={option.thumbnailUrl}
                alt={`${option.label} 썸네일`}
                className="h-9 w-16 shrink-0 rounded-sm object-cover"
              />
            ) : (
              <div
                className="h-9 w-16 shrink-0 rounded-sm bg-gray-200"
                role="img"
                aria-label={`${option.label} 썸네일 없음`}
              />
            )}
            <span className="min-w-0 leading-tight text-current">
              <span className="block truncate text-body-m-bold">{option.label}</span>
              {option.subLabel && <span className={subLabelClassName}>{option.subLabel}</span>}
            </span>
          </div>
        ) : option.subLabel ? (
          <div className="flex flex-col leading-tight text-current">
            <span className="text-body-m-bold">{option.label}</span>
            <span className={subLabelClassName}>{option.subLabel}</span>
          </div>
        ) : (
          <span className="text-current">{option.label}</span>
        ),
      onClick: () => m.onSelectDataSource(option.key),
      selected: isSelectedItem,
    };
  });

  const selectedThumbNode =
    selectedDataSourceOption?.kind === 'video' ? (
      selectedDataSourceOption.thumbnailUrl ? (
        <img
          src={selectedDataSourceOption.thumbnailUrl}
          alt={`${m.selectedDataSourceLabel} 썸네일`}
          className="h-9 w-16 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <div
          className="h-9 w-16 shrink-0 rounded-sm bg-gray-200"
          role="img"
          aria-label={`${m.selectedDataSourceLabel} 썸네일 없음`}
        />
      )
    ) : null;

  const navigateToVideoTime = useCallback(
    (seconds: number) => {
      if (!canSeekToSelectedVideo || !selectedVideoId) return;
      if (!Number.isFinite(seconds) || seconds < 0) return;

      const seekSeconds = Math.floor(seconds);
      if (isDemoProject(projectIdStr)) {
        navigate(`${DEMO_SHARE_PATH}?t=${seekSeconds}`);
        return;
      }
      navigate(`/${projectIdStr}/videos/${selectedVideoId}?t=${seekSeconds}`);
    },
    [canSeekToSelectedVideo, navigate, projectIdStr, selectedVideoId],
  );

  const navigateToSlideById = useCallback(
    (slideId: string | null) => {
      navigate(getTabPath(projectIdStr, 'slide', slideId ?? undefined));
    },
    [navigate, projectIdStr],
  );

  const navigateToSlideByIndex = useCallback(
    (slideIndex: number) => {
      navigateToSlideById(getSlideIdByIndex(slideIndex));
    },
    [getSlideIdByIndex, navigateToSlideById],
  );

  const navigateToSlideTime = useCallback(
    (slideIndex: number) => {
      const seekSeconds = getSeekSecondsForSlide(slideIndex);
      if (canSeekToSelectedVideo && seekSeconds !== null) {
        navigateToVideoTime(seekSeconds);
        return;
      }

      navigateToSlideByIndex(slideIndex);
    },
    [canSeekToSelectedVideo, getSeekSecondsForSlide, navigateToSlideByIndex, navigateToVideoTime],
  );

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      tabIndex={0}
      className="h-full overflow-y-auto bg-gray-100"
    >
      {m.isLoading ? (
        <InsightPageSkeleton />
      ) : (
        <div className="flex flex-col gap-6 px-4 py-6 md:px-18 md:py-8">
          {m.isError && (
            <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-body-s text-gray-800">
              데이터를 불러오는 중 문제가 발생했습니다.
              {m.errorMessage ? ` (${m.errorMessage})` : ''}
            </div>
          )}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-body-l-bold text-gray-800">발표 인사이트</h1>
              <p className="text-body-s text-gray-600">발표 자료 분석 결과를 확인하세요</p>
            </div>

            {m.hasVideo && (
              <div className="w-full md:w-80">
                <p className="mb-2 text-body-s text-gray-600">분석 대상</p>
                <Dropdown
                  trigger={({ isOpen }) => (
                    <button
                      type="button"
                      className={clsx(
                        'flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-5 py-3 text-left',
                        'cursor-pointer',
                        isOpen && 'border-gray-400',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3 text-left">
                        {selectedThumbNode}
                        <span className="block truncate text-body-m-bold text-gray-800">
                          {m.selectedDataSourceLabel}
                          {m.selectedDataSourceSubLabel && (
                            <span className="mt-0.5 block truncate text-caption text-gray-700">
                              {m.selectedDataSourceSubLabel}
                            </span>
                          )}
                        </span>
                      </span>
                      <svg
                        className={clsx(
                          'h-4 w-4 shrink-0 text-gray-600 transition-transform',
                          isOpen && 'rotate-180',
                        )}
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                  items={dataSourceItems}
                  className="w-full"
                  menuClassName="max-h-72 w-full overflow-y-auto"
                  align="start"
                  ariaLabel="인사이트 분석 대상 선택"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <SummaryStatsSection stats={m.summaryStats} />

            <DropOffAnalysisSection
              dropOffSlides={m.dropOffSlides}
              dropOffTimes={m.dropOffTimes}
              getThumb={m.getThumb}
              showVideoDropOff={m.isVideoSource}
              onSlideThumbClick={navigateToSlideTime}
              onVideoTimeClick={canSeekToSelectedVideo ? navigateToVideoTime : undefined}
            />

            <RetentionChartCard
              title={m.retentionTitle}
              data={m.retentionData}
              isVideo={m.retentionIsVideo}
              onVideoTimeClick={canSeekToSelectedVideo ? navigateToVideoTime : undefined}
              onSlidePointClick={navigateToSlideTime}
            />

            <div className="grid grid-cols-1 gap-12 py-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <FeedbackDistributionSection
                projectId={m.projectIdStr ?? ''}
                title={m.feedbackDistributionTitle}
                reactionCounts={m.feedbackDistributionCounts}
                totalCount={m.feedbackDistributionTotalCount}
              />

              <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
                <h3 className="text-body-l-bold text-gray-800">
                  {m.isVideoSource
                    ? '영상에서 반응이 가장 많았던 슬라이드'
                    : '가장 많은 피드백을 받은 슬라이드'}
                </h3>
                <div className="flex flex-wrap items-start gap-4">
                  {m.topSlides.length > 0 ? (
                    m.topSlides.map(({ slideId, slide, slideIndex, title }, index) => {
                      const summary = m.topSlideReactionSummaries?.[index];
                      const baseReactions = createDefaultReactions();
                      const summaryReactions = summary
                        ? baseReactions.map((reaction) => ({
                            ...reaction,
                            count: summary[reaction.type] ?? 0,
                          }))
                        : baseReactions;
                      const reactionMetrics = summaryReactions
                        .filter((reaction) => reaction.count > 0)
                        .sort((a, b) => b.count - a.count);
                      const seekSeconds = getSeekSecondsForSlide(slideIndex);
                      const targetSlideId =
                        slide?.slideId ?? slideId ?? getSlideIdByIndex(slideIndex);
                      const onThumbClick = () => {
                        if (canSeekToSelectedVideo && seekSeconds !== null) {
                          navigateToVideoTime(seekSeconds);
                          return;
                        }

                        navigateToSlideById(targetSlideId);
                      };

                      return (
                        <TopSlideCard
                          key={slideId ?? slide?.slideId ?? `slide-${slideIndex}`}
                          title={title}
                          thumbUrl={m.getThumb(slideIndex)}
                          reactionMetrics={reactionMetrics}
                          onThumbClick={onThumbClick}
                        />
                      );
                    })
                  ) : (
                    <p className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-6 text-body-s text-gray-600">
                      데이터를 분석 중이거나 결과가 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <RecentCommentsSection
              hasVideo={m.hasVideo}
              isVideoSource={m.isVideoSource}
              recentCommentsData={m.recentCommentsData}
              onSeekCommentTime={canSeekToSelectedVideo ? navigateToVideoTime : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
