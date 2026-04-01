import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/reset.css';
import './theme/themes.css';
import './theme/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
