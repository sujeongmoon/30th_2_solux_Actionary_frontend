(window as any).global = window;
(globalThis as any).global = globalThis as any;
(globalThis as any).global = globalThis as any;
(globalThis as any).process = { env: {} };

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // 실패 시 재시도 횟수
      refetchOnWindowFocus: false, // 탭 포커스 시 재요청 방지
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);