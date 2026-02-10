import { useCallback, useEffect, useRef } from 'react';

import type { RecordExitRequestDto } from '@/api/dto/analytics.dto';
import { recordExit as recordExitApi } from '@/api/endpoints/analytics';
import { useRecordExit } from '@/hooks/queries/useAnalytics';

type ExitMode = 'unload' | 'unmount';

/**
 * 페이지 이탈 추적 훅
 *
 * pagehide / visibilitychange 이벤트와 컴포넌트 언마운트 시
 * 이탈 데이터를 서버에 전송합니다. 중복 전송을 방지합니다.
 *
 * @param buildExitPayload - 이탈 시 전송할 페이로드를 생성하는 콜백 (null 반환 시 전송 생략)
 */
export function useExitTracker(buildExitPayload: () => RecordExitRequestDto | null) {
  const { mutate } = useRecordExit();
  const exitSentRef = useRef(false);

  const sendExit = useCallback(
    (mode: ExitMode) => {
      if (exitSentRef.current) return;
      const payload = buildExitPayload();
      if (!payload) return;

      exitSentRef.current = true;
      if (mode === 'unload') {
        recordExitApi(payload);
      } else {
        mutate(payload);
      }
    },
    [buildExitPayload, mutate],
  );

  useEffect(() => {
    const handlePageHide = () => sendExit('unload');
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendExit('unload');
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendExit('unmount');
    };
  }, [sendExit]);
}
