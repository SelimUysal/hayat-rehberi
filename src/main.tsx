import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installGlobalDiagnostics, recordGlobalError } from './utils/globalDiagnostics';

installGlobalDiagnostics();

(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

createRoot(document.getElementById('root')!, {
  onUncaughtError: (error) => recordGlobalError({source:'react',name: error instanceof Error ? error.name : 'Error', message: error instanceof Error ? error.message : undefined}),
  onCaughtError: (error) => recordGlobalError({source:'react',name: error instanceof Error ? error.name : 'Error', message: error instanceof Error ? error.message : undefined}),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

