import { IAnalyticsProvider, StandardEventName } from "../core/types";

const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

declare global {
  interface Window {
    ttq: any;
  }
}

export class TikTokPixelProvider implements IAnalyticsProvider {
  name = "TikTokPixel";

  initialize() {
    if (!TIKTOK_PIXEL_ID) return;
    if (typeof window === "undefined" || window.ttq) return;

    (function (w:any, _d:any, t:any) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t:any,e:any){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t:any){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e:any,n:any){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];if (e.parentNode) e.parentNode.insertBefore(n,e)};
      ttq.load(TIKTOK_PIXEL_ID);
    })(window, document, 'ttq');
  }

  trackPageView(_url?: string, _title?: string, _language?: string) {
    if (!window.ttq) return;
    window.ttq.page();
  }

  trackEvent(eventName: StandardEventName, properties?: Record<string, any>) {
    if (!window.ttq) return;
    
    // Map standard events to TikTok standard events
    const eventMapping: Record<string, string> = {
      Lead: "SubmitForm",
      Contact: "Contact",
      NewsletterSignup: "Subscribe",
      UserRegistered: "CompleteRegistration",
      SearchPerformed: "Search",
      Download: "Download",
      ButtonClicked: "ClickButton",
    };

    const ttEvent = eventMapping[eventName];
    
    if (ttEvent) {
      window.ttq.track(ttEvent, properties || {});
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!window.ttq) return;
    window.ttq.identify({
      external_id: userId,
      ...traits
    });
  }
}
