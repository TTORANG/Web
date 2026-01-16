export function ProjectCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border-none bg-white">
      <div className="w-full aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="mt-2 h-3 w-24 rounded bg-gray-200 animate-pulse" />

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </article>
  );
}
