import CommentCountIcon from '@/assets/icons/icon-comment-count.svg?react';
import MoreIcon from '@/assets/icons/icon-more.svg?react';
import PageCountIcon from '@/assets/icons/icon-page-count.svg?react';
import ReactionCountIcon from '@/assets/icons/icon-reaction-count.svg?react';
import RecentIcon from '@/assets/icons/icon-recent.svg?react';
import ViewCountIcon from '@/assets/icons/icon-view-count.svg?react';

export default function PresentationListSkeleton() {
  return (
    <article className="flex w-full items-center justify-between bg-white px-5 py-4 rounded-2xl border border-gray-200">
      <div className="w-35 h-19.5 shrink-0 overflow-hidden rounded-lg bg-gray-200 animate-pulse" />

      <div className="flex flex-1 items-center justify-between pl-6">
        <div className="flex flex-col gap-0.5">
          <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />

          <div className="flex items-center gap-4 text-caption text-gray-600">
            <div className="flex items-center gap-4">
              <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              <span className="flex items-center gap-1.5">
                <RecentIcon className="w-4 h-4" />
                <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
              </span>
            </div>

            <span className="h-3.5 w-px bg-gray-200" />

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <PageCountIcon className="w-4 h-4" />
                <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <CommentCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <ReactionCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
              <span className="flex items-center gap-1">
                <ViewCountIcon className="w-4 h-4" />
                <div className="h-3 w-4 rounded bg-gray-200 animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        <div className="-m-2">
          <div className="p-2">
            <MoreIcon className="text-gray-600" />
          </div>
        </div>
      </div>
    </article>
  );
}
