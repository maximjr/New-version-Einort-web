import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import critical namespaces statically
import enCommon from './locales/en/common.json';
import enNavbar from './locales/en/navbar.json';
import enHero from './locales/en/hero.json';
import enErrors from './locales/en/errors.json';

import frCommon from './locales/fr/common.json';
import frNavbar from './locales/fr/navbar.json';
import frHero from './locales/fr/hero.json';
import frErrors from './locales/fr/errors.json';

const resources = {
  en: {
    common: enCommon,
    navbar: enNavbar,
    hero: enHero,
    errors: enErrors
  },
  fr: {
    common: frCommon,
    navbar: frNavbar,
    hero: frHero,
    errors: frErrors
  }
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS: 'common',
    ns: ['common', 'home', 'services', 'contact', 'navbar', 'footer', 'faq', 'about', 'hero', 'forms', 'validation', 'errors', 'seo', 'admin', 'case_studies'],
    partialBundledLanguages: true,
    resources,
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'default'
      },
      reloadInterval: false,
      request: (options: any, url: string, _payload: any, callback: any) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        fetch(url, { ...options, signal: controller.signal })
          .then((res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((data) => {
            callback(null, { status: 200, data });
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            console.error(`i18n fetch failed for ${url}:`, error);
            
            // Extract namespace from URL (e.g. /locales/en/contact.json -> contact)
            const match = url.match(/\/locales\/[^/]+\/([^/]+)\.json/);
            const ns = match ? match[1] : null;
            
            // Attempt to fallback to bundled english resources if this fetch fails
            if (ns && (resources.en as any)[ns]) {
              callback(null, { status: 200, data: JSON.stringify((resources.en as any)[ns]) });
            } else {
              callback(error, { status: 500, data: '' });
            }
          });
      }
    },
    detection: {
      order: ['path', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
      cookieMinutes: 43200, // Persist for 30 days
      cookieOptions: { path: '/', sameSite: 'strict' }
    }
  });

export default i18n;
