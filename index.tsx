/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// NOTE: Removed Node 'applicationinsights' require which broke browser rendering (require undefined in ESM). 
// If Azure App Insights is desired for the web build, add @microsoft/applicationinsights-web and lazy init:
// if (import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING) {
//   import('@microsoft/applicationinsights-web').then(({ ApplicationInsights }) => {
//     const appInsights = new ApplicationInsights({ config: { connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING }});
//     appInsights.loadAppInsights();
//   });
// }

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { setAppInsights } from './telemetry';

// App Insights web init (optional via env)
const conn = (import.meta as any).env?.VITE_APPINSIGHTS_CONNECTION_STRING;
if (conn) {
  import('@microsoft/applicationinsights-web').then(({ ApplicationInsights }) => {
    const ai = new ApplicationInsights({ config: { connectionString: conn } });
    ai.loadAppInsights();
    (window as any).appInsights = ai; // still expose for debugging
    setAppInsights(ai);
    ai.trackTrace({ message: 'AppInsights initialized' });
  }).catch(e => console.warn('AppInsights init failed', e));
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
