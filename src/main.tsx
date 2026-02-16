import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { initPosthog } from '@/analytics/posthogClient';
import { AppProviders } from '@/providers';
import '@/styles/index.css';

function activateFontStylesheet(): void {
  const fontStylesheet = document.querySelector<HTMLLinkElement>('#pretendard-font-stylesheet');
  if (!fontStylesheet) return;

  const enableStylesheet = () => {
    fontStylesheet.media = 'all';
  };

  fontStylesheet.addEventListener('load', enableStylesheet, { once: true });
  if (fontStylesheet.sheet) {
    enableStylesheet();
  }
}

activateFontStylesheet();
initPosthog();

// enableMocking 프로미스 대기 없이 바로 렌더링을 시작합니다.
createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
