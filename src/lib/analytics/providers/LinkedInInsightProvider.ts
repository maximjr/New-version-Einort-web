import { IAnalyticsProvider, StandardEventName } from "../core/types";

const LINKEDIN_PARTNER_ID = import.meta.env.VITE_LINKEDIN_PARTNER_ID;

declare global {
  interface Window {
    _linkedin_data_partner_ids: any[];
    lintrk: any;
  }
}

export class LinkedInInsightProvider implements IAnalyticsProvider {
  name = "LinkedInInsight";

  initialize() {
    if (!LINKEDIN_PARTNER_ID) return;
    if (typeof window === "undefined" || window.lintrk) return;

    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);

    (function(l:any) {
      if (!l){window.lintrk = function(a:any,b:any){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      if (s.parentNode) s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  }

  trackPageView(_url?: string, _title?: string, _language?: string) {
    // LinkedIn Insight automatically tracks page views.
  }

  trackEvent(_eventName: StandardEventName, _properties?: Record<string, any>) {
    // LinkedIn primarily uses conversion IDs, which you normally set up in the dashboard.
    // However, you can pass custom events if needed, but it's typically URL based.
  }
}
