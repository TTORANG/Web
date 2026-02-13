// src/pages/insight/InsightPage.tsx
import { Skeleton } from '@/components/common';
import { SummaryStatsSection } from '@/components/insight';
import { DropOffAnalysisSection } from '@/components/insight';
import { FeedbackDistributionSection } from '@/components/insight';
import { TopSlideCard } from '@/components/insight';
import { RecentCommentsSection } from '@/components/insight/RecentCommentsSection';
import { RetentionChartCard } from '@/components/insight/charts/RetentionChartCard';
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
        <div className="flex flex-wrap gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="flex min-w-0 flex-1 basis-full flex-col gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:min-w-60 sm:basis-78"
            >
              <Skeleton width="50%" height={14} />
              <Skeleton width="40%" height={22} />
              <Skeleton width="60%" height={12} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              className="flex min-w-0 flex-1 basis-full flex-col gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 lg:basis-160"
            >
              <Skeleton width="40%" height={18} />
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center gap-4">
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

          <div className="flex flex-col gap-6">
            <Skeleton width="60%" height={18} />
            <div className="flex flex-wrap items-start gap-4">
              {[0, 1, 2].map((idx) => (
                <Skeleton.Card key={idx} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
          <Skeleton width="30%" height={18} className="mb-4" />
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((idx) => (
              <Skeleton.ListItem key={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsightPage() {
  const m = useInsightPageModel();

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      className="h-full overflow-y-auto bg-gray-100"
    >
      {m.isLoading ? (
        <InsightPageSkeleton />
      ) : (
        <div className="flex flex-col gap-6 px-4 py-6 md:px-18 md:py-8">
          {m.isError && (
            <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-body-s text-error">
              데이터를 불러오는 중 문제가 발생했습니다.
              {m.errorMessage ? ` (${m.errorMessage})` : ''}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-body-l-bold text-gray-800">발표 인사이트</h1>
            <p className="text-body-s text-gray-600">발표 자료 분석 결과를 확인하세요</p>
          </div>

          <div className="flex flex-col gap-4">
            <SummaryStatsSection stats={m.summaryStats} />

            <DropOffAnalysisSection
              dropOffSlides={m.dropOffSlides}
              dropOffTimes={m.dropOffTimes}
              getThumb={m.getThumb}
              showVideoDropOff={m.hasVideo}
            />

            <RetentionChartCard
              title={m.retentionTitle}
              data={m.retentionData}
              isVideo={m.retentionIsVideo}
            />

            <div className="grid grid-cols-1 gap-12 py-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <FeedbackDistributionSection projectId={m.projectIdStr ?? ''} />

              <div className="flex flex-col gap-6">
                <h3 className="text-body-l-bold text-gray-800">가장 많은 피드백을 받은 슬라이드</h3>
                <div className="flex flex-wrap items-start gap-4">
                  {m.topSlides.map(({ slideId, slide, slideIndex, title }, index) => {
                    const summary = m.topSlideReactionSummaries?.[index];
                    const baseReactions = createDefaultReactions();
                    const summaryReactions = summary
                      ? baseReactions.map((reaction) => ({
                          ...reaction,
                          count: summary[reaction.type] ?? 0,
                        }))
                      : baseReactions;
                    const reactionMetrics = summaryReactions.filter(
                      (reaction) => reaction.count > 0,
                    );

                    return (
                      <TopSlideCard
                        key={slideId ?? slide?.slideId ?? `slide-${slideIndex}`}
                        title={title}
                        thumbUrl={m.getThumb(slideIndex)}
                        reactionMetrics={reactionMetrics}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <RecentCommentsSection
              hasVideo={m.hasVideo}
              recentCommentsData={m.recentCommentsData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
