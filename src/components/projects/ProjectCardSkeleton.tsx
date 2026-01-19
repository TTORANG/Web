import { Skeleton } from '../common';

export function ProjectCardSkeleton() {
  return (
    // TODO
    // 아래 두 개중에 뭐가 나은가요..
    // Skeleton.Card : 있던거 끌어온거
    // article 부분 : figma 디자인대로 스켈레톤 만든 거
    <Skeleton.Card className="overflow-hidden rounded-2xl border-none bg-white p-0" />
    // <article className="overflow-hidden rounded-2xl border-none bg-white">
    //   <div className="w-full aspect-video bg-gray-200 animate-pulse" />
    //   <div className="p-4">
    //     <div className="flex items-center justify-between">
    //       <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
    //       <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
    //     </div>
    //     <div className="mt-2 h-3 w-24 rounded bg-gray-200 animate-pulse" />

    //     <div className="mt-5 flex items-center justify-between gap-3">
    //       <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
    //       <div className="flex gap-3">
    //         <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
    //         <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
    //         <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
    //       </div>
    //     </div>
    //   </div>
    // </article>
  );
}
