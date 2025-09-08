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

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
