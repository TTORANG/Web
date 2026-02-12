import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { usePresentation } from '@/hooks/queries/usePresentations';
import { useSharedContent } from '@/hooks/queries/useShares';
import dayjs from '@/utils/dayjs';

type SharedContentLike = {
  shareInfo?: { createdAt?: string };
  projectContent?: {
    title?: string;
    postedAt?: string;
    publisherName?: string;
    userName?: string;
  };
  presentation?: {
    name?: string;
    postedAt?: string;
    publisherName?: string;
  };
};

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
  const { projectId, shareToken } = useParams<{ projectId?: string; shareToken?: string }>();
  const { data: presentation } = usePresentation(projectId ?? '');
  const { data: sharedContent, isLoading, isError } = useSharedContent(shareToken);

  const info = useMemo(() => {
    const shared = (sharedContent ?? null) as SharedContentLike | null;

    const title =
      presentation?.title?.trim() ||
      shared?.projectContent?.title?.trim() ||
      shared?.presentation?.name?.trim() ||
      FALLBACK_TITLE;

    const publisherName =
      presentation?.userName?.trim() ||
      shared?.projectContent?.publisherName?.trim() ||
      shared?.projectContent?.userName?.trim() ||
      shared?.presentation?.publisherName?.trim() ||
      FALLBACK_PUBLISHER;

    const postedAtRaw =
      presentation?.updatedAt ||
      shared?.projectContent?.postedAt ||
      shared?.presentation?.postedAt ||
      shared?.shareInfo?.createdAt;

    return {
      title,
      publisherName,
      postedAt: formatPostedAt(postedAtRaw),
    };
  }, [presentation, sharedContent]);

  return {
    ...info,
    isLoading,
    isError,
  };
}
