import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPage } from './pages/LandingPage';

import.meta.hot?.on('gallery:changed', () => window.location.reload());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
