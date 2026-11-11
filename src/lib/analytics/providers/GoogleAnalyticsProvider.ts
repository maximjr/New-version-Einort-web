import { IAnalyticsProvider, StandardEventName } from "../core/types";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export class GoogleAnalyticsProvider implements IAnalyticsProvider {
  name = "GoogleAnalytics";

  initialize() {
    if (!GA_MEASUREMENT_ID) return;
    if (typeof window === "undefined" || window.gtag) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // Managed manually by trackPageView
    });
  }

  trackPageView(url?: string, title?: string, language?: string) {
    if (!window.gtag || !GA_MEASUREMENT_ID) return;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: url,
      page_title: title,
      language: language,
    });
  }

  trackEvent(eventName: StandardEventName, properties?: Record<string, any>) {
    if (!window.gtag) return;
    
    // Convert CamelCase to snake_case for GA4
    const gaEventName = eventName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    
    window.gtag("event", gaEventName, properties || {});
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!window.gtag || !GA_MEASUREMENT_ID) return;
    window.gtag("config", GA_MEASUREMENT_ID, {
      user_id: userId,
      ...traits,
    });
  }
}
