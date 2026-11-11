import { IAnalyticsProvider, StandardEventName } from "../core/types";

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "1059601826410794";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export class MetaPixelProvider implements IAnalyticsProvider {
  name = "MetaPixel";

  initialize() {
    if (!PIXEL_ID) return;
    if (typeof window === "undefined" || window.fbq) return;

    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        b.head.appendChild(t);
      }
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    try {
      window.fbq("init", PIXEL_ID);
    } catch (e) {
      console.error("[MetaPixel] Initialization error:", e);
    }
  }

  trackPageView(_url?: string, _title?: string, _language?: string) {
    if (!window.fbq) return;
    try {
      window.fbq("track", "PageView");
    } catch (e) {
      console.error("[MetaPixel] PageView tracking error:", e);
    }
  }

  trackEvent(eventName: StandardEventName, properties?: Record<string, any>) {
    if (!window.fbq) return;
    
    // Map standard events to Meta standard events
    const eventMapping: Record<string, string> = {
      Lead: "Lead",
      Contact: "Contact",
      NewsletterSignup: "Subscribe",
      QuoteRequest: "Lead",
      SearchPerformed: "Search",
      UserRegistered: "CompleteRegistration",
    };

    const metaEvent = eventMapping[eventName];
    
    try {
      if (metaEvent) {
        window.fbq("track", metaEvent, properties || {});
      } else {
        window.fbq("trackCustom", eventName, properties || {});
      }
    } catch (e) {
      console.error(`[MetaPixel] Event tracking error for ${eventName}:`, e);
    }
  }
}
