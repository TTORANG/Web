import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { AppProviders } from '@/providers';
import '@/styles/index.css';

// enableMocking 프로미스 대기 없이 바로 렌더링을 시작합니다.
createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
