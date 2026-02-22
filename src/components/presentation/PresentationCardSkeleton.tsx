export default function PresentationCardSkeleton() {
  return (
    <article className="rounded-2xl border-none bg-white">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="min-h-18">
          <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="mt-1 h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </article>
  );
}
