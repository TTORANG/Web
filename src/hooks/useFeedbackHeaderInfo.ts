import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useSharedContent } from '@/hooks/queries/useShares';
import dayjs from '@/utils/dayjs';

const FALLBACK_TITLE = '내 발표';
const FALLBACK_PUBLISHER = '알 수 없음';
const FALLBACK_POSTED_AT = '-';

function formatPostedAt(value?: string): string {
  if (!value) return FALLBACK_POSTED_AT;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return FALLBACK_POSTED_AT;
  return parsed.format('YYYY.MM.DD HH:mm:ss');
}

export function useFeedbackHeaderInfo() {
  const { shareToken } = useParams<{ shareToken?: string }>();
  const { data: sharedContent, isLoading, isError } = useSharedContent(shareToken);

  const info = useMemo(() => {
    const title = sharedContent?.projectContent?.title?.trim() || FALLBACK_TITLE;

    const publisherName = sharedContent?.shareInfo?.publisherName?.trim() || FALLBACK_PUBLISHER;

    const postedAtRaw = sharedContent?.shareInfo?.createdAt?.trim() ?? FALLBACK_POSTED_AT;

    return {
      title,
      publisherName,
      postedAt: formatPostedAt(postedAtRaw),
    };
  }, [sharedContent]);

  return {
    ...info,
    isLoading,
    isError,
  };
}
