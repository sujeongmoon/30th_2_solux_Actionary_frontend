(window as any).global = window;
(globalThis as any).global = globalThis as any;
(globalThis as any).global = globalThis as any;
(globalThis as any).process = { env: {} };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
