import { useEffect } from 'react';
import { useAnalytics } from '../AnalyticsProvider';
import { StandardEventName } from '../core/types';

export function useTrackEvent() {
  const analytics = useAnalytics();

  return (eventName: StandardEventName, properties?: Record<string, any>) => {
    analytics.trackEvent(eventName, properties);
  };
}

export function useLeadTracking() {
  const analytics = useAnalytics();

  return (properties?: Record<string, any>) => {
    analytics.trackEvent('Lead', properties);
  };
}

export function useTrackPage(pageName?: string) {
  const analytics = useAnalytics();

  useEffect(() => {
    // AnalyticsProvider already handles route changes, 
    // but this can be used for custom virtual pages if needed.
    if (pageName) {
      analytics.trackPageView(window.location.pathname, pageName);
    }
  }, [pageName, analytics]);
}
