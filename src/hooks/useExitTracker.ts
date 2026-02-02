import { useCallback, useEffect, useRef } from 'react';

import { type RecordExitRequest } from '@/api/endpoints/analytics';
import { recordExitOnUnload, useRecordExit } from '@/hooks/useAnalytics';

type ExitMode = 'unload' | 'unmount';

export function useExitTracker(buildExitPayload: () => RecordExitRequest | null) {
  const { mutate: recordExit } = useRecordExit();
  const exitSentRef = useRef(false);

  const sendExit = useCallback(
    (mode: ExitMode) => {
      if (exitSentRef.current) return;
      const payload = buildExitPayload();
      if (!payload) return;

      exitSentRef.current = true;
      if (mode === 'unload') {
        recordExitOnUnload(payload);
      } else {
        recordExit(payload);
      }
    },
    [buildExitPayload, recordExit],
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
