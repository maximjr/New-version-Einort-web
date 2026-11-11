export type StandardEventName =
  | "PageView"
  | "Lead"
  | "Contact"
  | "QuoteRequest"
  | "ConsultationBooked"
  | "NewsletterSignup"
  | "Download"
  | "ERPDemoRequest"
  | "ServiceInquiry"
  | "LanguageChanged"
  | "ButtonClicked"
  | "VideoPlayed"
  | "FileDownloaded"
  | "PhoneClicked"
  | "EmailClicked"
  | "ExternalLinkClicked"
  | "SocialMediaClicked"
  | "SearchPerformed"
  | "UserRegistered"
  | "UserLoggedIn"
  | "Error"
  | "Exception"
  | "Performance";

export interface IAnalyticsProvider {
  name: string;
  initialize(): void;
  trackPageView(url: string, title?: string, language?: string): void;
  trackEvent(eventName: StandardEventName, properties?: Record<string, any>): void;
  identify?(userId: string, traits?: Record<string, any>): void;
}
