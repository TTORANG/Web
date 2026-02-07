import SlideThumb from './SlideThumb';

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
}: RecentCommentItemProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4">
      {/* 썸네일 */}
      <SlideThumb
        src={thumbUrl}
        alt={`${slideLabel} 썸네일`}
        className="h-19.5 w-35 shrink-0 rounded object-cover"
        fallbackClassName="h-[78px] w-[140px] shrink-0 rounded bg-gray-200"
      />

      {/* 댓글 내용 */}
      <div className="flex flex-1 items-center pl-6">
        <div className="flex flex-1 flex-col gap-1">
          {/* 유저 정보 */}
          <div className="flex items-center gap-2">
            {/* 아바타 */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="var(--color-gray-600)"
                />
              </svg>
            </div>
            <span className="text-body-m-bold text-gray-800">{user}</span>
            <span className="text-body-s text-gray-600">{slideLabel}</span>
          </div>

          {/* 댓글 텍스트 */}
          <div className="flex items-center gap-1 pl-10">
            <span className="text-body-m text-main-variant1">{time}</span>
            <span className="text-body-m text-gray-800">{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
