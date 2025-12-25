
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// إعداد بيئة وهمية لـ process لتجنب أخطاء المكتبات التي تعتمد عليها في المتصفح
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { API_KEY: "" } };
}

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
