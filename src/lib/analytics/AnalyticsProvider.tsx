import React, { useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnalyticsService } from './core/AnalyticsService';
import { GoogleAnalyticsProvider } from './providers/GoogleAnalyticsProvider';
import { MetaPixelProvider } from './providers/MetaPixelProvider';
import { MicrosoftClarityProvider } from './providers/MicrosoftClarityProvider';
import { TikTokPixelProvider } from './providers/TikTokPixelProvider';
import { LinkedInInsightProvider } from './providers/LinkedInInsightProvider';

interface AnalyticsContextValue {
  service: typeof AnalyticsService;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Register providers
    AnalyticsService.registerProvider(new GoogleAnalyticsProvider());
    AnalyticsService.registerProvider(new MetaPixelProvider());
    AnalyticsService.registerProvider(new MicrosoftClarityProvider());
    AnalyticsService.registerProvider(new TikTokPixelProvider());
    AnalyticsService.registerProvider(new LinkedInInsightProvider());

    // Initialize (Hook this up to cookie consent if needed)
    AnalyticsService.initialize();
  }, []);

  useEffect(() => {
    // Track PageView on route change
    const timeoutId = setTimeout(() => {
      const url = window.location.pathname + window.location.search;
      const title = document.title;
      const lang = i18n.resolvedLanguage || 'en';
      
      AnalyticsService.trackPageView(url, title, lang);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, i18n.resolvedLanguage]);

  return (
    <AnalyticsContext.Provider value={{ service: AnalyticsService }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context.service;
}
