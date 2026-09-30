import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker immediately for Android WebAPK & offline installability
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
