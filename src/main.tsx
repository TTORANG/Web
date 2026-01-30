import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { enableMocking } from '@/bootstrap/enableMocking';
import { AppProviders } from '@/providers';
import '@/styles/index.css';

enableMocking().then(() => {
  createRoot(document.querySelector('#root')!).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  );
});
