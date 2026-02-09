// src/pages/insight/InsightPage.tsx
import { SummaryStatsSection } from '@/components/insight';
import { DropOffAnalysisSection } from '@/components/insight';
import { FeedbackDistributionSection } from '@/components/insight';
import { TopSlideCard } from '@/components/insight';
import { RecentCommentsSection } from '@/components/insight/RecentCommentsSection';
import { RetentionChartCard } from '@/components/insight/charts/RetentionChartCard';
import { createDefaultReactions } from '@/constants/reaction';
import { useInsightPageModel } from '@/hooks/useInsightPageModel';

export default function InsightPage() {
  const m = useInsightPageModel();

  return (
    <div
      role="tabpanel"
      id="tabpanel-insight"
      aria-labelledby="tab-insight"
      className="h-full overflow-y-auto bg-gray-100"
    >
      <div className="flex flex-col gap-6 px-18 py-8">
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

          <div className="flex flex-wrap items-start justify-between gap-6 py-4">
            <FeedbackDistributionSection projectId={m.projectIdStr ?? ''} />

            <div className="flex min-w-80 flex-1 basis-160 flex-col gap-6">
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
                  const reactionMetrics = summaryReactions.filter((reaction) => reaction.count > 0);

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
          <RecentCommentsSection hasVideo={m.hasVideo} recentCommentsData={m.recentCommentsData} />
        </div>
      </div>
    </div>
  );
}
