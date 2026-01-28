interface RecentCommentItemProps {
  user: string;
  slideLabel: string;
  time: string;
  text: string;
  thumbUrl?: string;
  thumbFallbackClassName: string;
}

export default function RecentCommentItem({
  user,
  slideLabel,
  time,
  text,
  thumbUrl,
  thumbFallbackClassName,
}: RecentCommentItemProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex items-start gap-4">
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`${slideLabel} 썸네일`}
          className="w-20 h-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div className={`w-20 h-12 ${thumbFallbackClassName} shrink-0`} aria-hidden="true" />
      )}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gray-300" aria-hidden="true" />
          <span className="text-body-m-bold text-gray-800">{user}</span>
          <span className="text-body-s text-gray-600">{slideLabel}</span>
        </div>
        <div className="mb-1">
          <span className="text-body-m text-main-variant1 mr-2">{time}</span>
          <span className="text-body-m text-blue-800">{text}</span>
        </div>
      </div>
    </div>
  );
}
