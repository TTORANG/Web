import { UserAvatar } from '@/components/common';

import SlideThumb from './SlideThumb';

interface RecentCommentItemProps {
  user: string;
  userProfileImage?: string;
  slideLabel: string;
  time: string;
  text: string;
  thumbUrl?: string;
  thumbFallbackClassName: string;
}

export default function RecentCommentItem({
  user,
  userProfileImage,
  slideLabel,
  time,
  text,
  thumbUrl,
}: RecentCommentItemProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 my-2">
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
            <UserAvatar src={userProfileImage} alt={user} size={32} />
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
