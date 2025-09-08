import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// This module provides a thin wrapper so components can safely log events
// without needing to know if App Insights has finished initializing yet.

let appInsights: ApplicationInsights | null = null;
let pendingEvents: Array<{ name: string; properties?: Record<string, any> }> = [];

export function setAppInsights(instance: ApplicationInsights) {
  appInsights = instance;
  if (pendingEvents.length) {
    for (const evt of pendingEvents) {
      appInsights.trackEvent({ name: evt.name }, evt.properties);
    }
    pendingEvents = [];
  }
}

export function trackUserAction(name: string, properties?: Record<string, any>) {
  if (appInsights) {
    appInsights.trackEvent({ name }, properties);
  } else {
    pendingEvents.push({ name, properties });
  }
}
