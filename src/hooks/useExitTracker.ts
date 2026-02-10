import { useCallback, useEffect, useRef } from 'react';

import type { RecordExitRequestDto } from '@/api/dto/analytics.dto';
import { useRecordExit } from '@/hooks/queries/useAnalytics.ts';

/**
 * 페이지 이탈 추적 훅
 *
 * 브라우저 종료/새로고침/탭 이동 시 pagehide 또는 beforeunload에서 이탈 데이터를 전송합니다.
 * visibilitychange는 창 가림/탭 전환에서도 발생하므로 사용하지 않습니다.
 *
 * @param buildExitPayload - 이탈 시 전송할 페이로드를 생성하는 콜백 (null 반환 시 전송 생략)
 */
export function useExitTracker(buildExitPayload: () => RecordExitRequestDto | null) {
  const { mutate } = useRecordExit();
  const exitSentRef = useRef(false);
  const buildExitPayloadRef = useRef(buildExitPayload);

  useEffect(() => {
    buildExitPayloadRef.current = buildExitPayload;
  }, [buildExitPayload]);

  const sendExit = useCallback(() => {
    if (exitSentRef.current) return;
    const payload = buildExitPayloadRef.current();
    if (!payload) return;

    exitSentRef.current = true;
    mutate(payload);
  }, [mutate]);

  useEffect(() => {
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      sendExit();
    };
    const handleBeforeUnload = () => sendExit();

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sendExit]);
}
