import { IAnalyticsProvider, StandardEventName } from "./types";

const IS_DEBUG = import.meta.env.DEV;

class AnalyticsServiceImpl {
  private providers: IAnalyticsProvider[] = [];
  private initialized = false;

  registerProvider(provider: IAnalyticsProvider) {
    this.providers.push(provider);
  }

  initialize() {
    if (this.initialized) return;
    this.providers.forEach(provider => {
      try {
        provider.initialize();
        if (IS_DEBUG) console.log(`[Analytics] Initialized provider: ${provider.name}`);
      } catch (err) {
        console.error(`[Analytics] Failed to initialize ${provider.name}`, err);
      }
    });
    this.initialized = true;
  }

  trackPageView(url: string, title?: string, language?: string) {
    if (IS_DEBUG) console.log(`[Analytics] PageView: ${url}`, { title, language });
    this.providers.forEach(provider => {
      try {
        provider.trackPageView(url, title, language);
      } catch (err) {
        console.error(`[Analytics] Error tracking PageView in ${provider.name}`, err);
      }
    });
  }

  trackEvent(eventName: StandardEventName, properties?: Record<string, any>) {
    if (IS_DEBUG) console.log(`[Analytics] Event: ${eventName}`, properties);
    this.providers.forEach(provider => {
      try {
        provider.trackEvent(eventName, properties);
      } catch (err) {
        console.error(`[Analytics] Error tracking event ${eventName} in ${provider.name}`, err);
      }
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (IS_DEBUG) console.log(`[Analytics] Identify: ${userId}`, traits);
    this.providers.forEach(provider => {
      try {
        if (provider.identify) {
          provider.identify(userId, traits);
        }
      } catch (err) {
        console.error(`[Analytics] Error identifying user in ${provider.name}`, err);
      }
    });
  }

  // --- Convenience Methods ---

  trackLead(properties?: Record<string, any>) {
    this.trackEvent("Lead", properties);
  }

  trackContact(properties?: Record<string, any>) {
    this.trackEvent("Contact", properties);
  }

  trackQuoteRequest(properties?: Record<string, any>) {
    this.trackEvent("QuoteRequest", properties);
  }

  trackConsultation(properties?: Record<string, any>) {
    this.trackEvent("ConsultationBooked", properties);
  }

  trackDownload(properties?: Record<string, any>) {
    this.trackEvent("Download", properties);
  }

  trackLogin(properties?: Record<string, any>) {
    this.trackEvent("UserLoggedIn", properties);
  }

  trackSignup(properties?: Record<string, any>) {
    this.trackEvent("UserRegistered", properties);
  }

  trackNewsletter(properties?: Record<string, any>) {
    this.trackEvent("NewsletterSignup", properties);
  }

  trackPhoneClick(properties?: Record<string, any>) {
    this.trackEvent("PhoneClicked", properties);
  }

  trackEmailClick(properties?: Record<string, any>) {
    this.trackEvent("EmailClicked", properties);
  }

  trackExternalLink(properties?: Record<string, any>) {
    this.trackEvent("ExternalLinkClicked", properties);
  }

  trackSocialClick(properties?: Record<string, any>) {
    this.trackEvent("SocialMediaClicked", properties);
  }

  trackLanguageSwitch(language: string) {
    this.trackEvent("LanguageChanged", { language });
  }

  trackError(error: Error | string, properties?: Record<string, any>) {
    this.trackEvent("Error", {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...properties
    });
  }

  trackPerformance(properties?: Record<string, any>) {
    this.trackEvent("Performance", properties);
  }
}

export const AnalyticsService = new AnalyticsServiceImpl();
