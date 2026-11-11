import { IAnalyticsProvider, StandardEventName } from "../core/types";

const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

declare global {
  interface Window {
    clarity: any;
  }
}

export class MicrosoftClarityProvider implements IAnalyticsProvider {
  name = "MicrosoftClarity";

  initialize() {
    if (!CLARITY_PROJECT_ID) return;
    if (typeof window === "undefined" || window.clarity) return;

    (function(c:any,l:any,a:any,r:any,i?:any,t?:any,y?:any){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }

  trackPageView(_url?: string, _title?: string, language?: string) {
    if (!window.clarity) return;
    if (language) {
      window.clarity("set", "language", language);
    }
  }

  trackEvent(eventName: StandardEventName, properties?: Record<string, any>) {
    if (!window.clarity) return;
    
    window.clarity("event", eventName);
    
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (typeof value === 'string' || typeof value === 'number') {
           window.clarity("set", `${eventName}_${key}`, String(value));
        }
      }
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!window.clarity) return;
    window.clarity("identify", userId, traits?.sessionId, traits?.pageId, traits?.friendlyName);
    
    if (traits) {
      for (const [key, value] of Object.entries(traits)) {
        if (typeof value === 'string' || typeof value === 'number') {
           window.clarity("set", key, String(value));
        }
      }
    }
  }
}
