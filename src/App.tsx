import { Suspense, useEffect, lazy } from "react";
import { lazyWithRetry } from "./lib/lazyWithRetry";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SEO } from "./components/seo/SEO";
import { AnalyticsProvider } from "./lib/analytics";

import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { Loadable } from "./components/shared/Loadable";

// Eagerly loaded features (Above the fold)
import { Hero } from "./features/home/Hero";

// Lazy loaded features
const Services = Loadable(
  lazyWithRetry(() => import("./features/home/Services").then((m) => ({ default: m.Services }))),
);
const ERP = Loadable(
  lazyWithRetry(() => import("./features/home/ERP").then((m) => ({ default: m.ERP }))),
);
const WhyChooseUs = Loadable(
  lazyWithRetry(() => import("./features/home/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs }))),
);
const Testimonials = Loadable(
  lazyWithRetry(() => import("./features/home/Testimonials").then((m) => ({ default: m.Testimonials }))),
);
const ContactUs = Loadable(
  lazyWithRetry(() => import("./features/home/ContactUs").then((m) => ({ default: m.ContactUs }))),
);
const FAQ = Loadable(
  lazyWithRetry(() => import("./features/home/FAQ").then((m) => ({ default: m.FAQ }))),
);
const CaseStudies = Loadable(
  lazyWithRetry(() => import("./features/home/CaseStudies").then((m) => ({ default: m.CaseStudies }))),
);
const ContactForm = Loadable(
  lazyWithRetry(() => import("./features/home/ContactForm").then((m) => ({ default: m.ContactForm }))),
);
const ContactPage = Loadable(
  lazyWithRetry(() => import("./features/contact/ContactPage").then((m) => ({ default: m.ContactPage }))),
);

const WorkPage = lazy(() => import("./features/work/WorkPage"));
const AboutPage = Loadable(
  lazyWithRetry(() => import("./features/about/AboutPage").then((m) => ({ default: m.AboutPage }))),
);
const AdminDashboard = Loadable(
  lazyWithRetry(() => import("./features/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))),
);
const ClientPortal = Loadable(
  lazyWithRetry(() => import("./features/client-portal/ClientPortal").then((m) => ({ default: m.ClientPortal }))),
);
const ServicesPage = Loadable(
  lazyWithRetry(() => import("./features/services/ServicesPage").then((m) => ({ default: m.ServicesPage }))),
);
const LocationPage = Loadable(
  lazyWithRetry(() => import("./features/seo/LocationPage").then((m) => ({ default: m.LocationPage }))),
);
const IndustryPage = Loadable(
  lazyWithRetry(() => import("./features/seo/IndustryPage").then((m) => ({ default: m.IndustryPage }))),
);
const CaseStudyPage = Loadable(
  lazyWithRetry(() => import("./features/case-studies/CaseStudyPage").then((m) => ({ default: m.CaseStudyPage }))),
);

function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-32"></div>}>
        <Services />
      </Suspense>
      <Suspense fallback={<div className="h-32"></div>}>
        <ERP />
      </Suspense>
      <Suspense fallback={<div className="h-32"></div>}>
        <WhyChooseUs />
        <CaseStudies />
      </Suspense>
      <Suspense fallback={<div className="h-32"></div>}>
        <Testimonials />
        <ContactForm />
      </Suspense>
      <Suspense fallback={<div className="h-32"></div>}>
        <ContactUs />
        <FAQ />
      </Suspense>
    </>
  );
}

import { WhatsAppMessenger } from "./components/layout/WhatsAppMessenger";

function MessengerWrapper() {
  return <WhatsAppMessenger />;
}

function Layout() {
  useEffect(() => {
    // 1. Detect touch devices strictly
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    // 2. Detect Safari strictly (often has rubber-banding issues with custom scroll)

    // 3. Detect low-end devices
    const isLowMemory =
      (navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory < 4;
    const isLowProcessing =
      navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
    
    // 4. Detect reduced motion and specific mobile strings
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Disable completely and fallback to native scrolling
    if (isTouchDevice || isLowMemory || isLowProcessing || isReducedMotion) {
      document.documentElement.classList.add("native-scroll");
      // Add native scroll styles dynamically just to be sure
      document.documentElement.style.scrollBehavior = "auto";
      return;
    }

    let animationFrameId: number | null = null;
    let lenisInstance: any = null;
    let isMounted = true;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (!isMounted) return;

        try {
          lenisInstance = new Lenis({
            duration: 1.0,               // slightly faster for crispness
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            // Strictly disable all touch/mobile interventions
            syncTouch: false,
            touchMultiplier: 1,
            wheelMultiplier: 1,
          });

          const raf = (time: number) => {
            if (!isMounted) {
              if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }
              return;
            }
            try {
              if (lenisInstance) {
                lenisInstance.raf(time);
              }
            } catch (e) {
              console.error("[Lenis] RAF crash prevented:", e);
            }
            if (isMounted) {
              animationFrameId = requestAnimationFrame(raf);
            }
          };

          animationFrameId = requestAnimationFrame(raf);
        } catch (e) {
          console.error("[Lenis] Initialization crash prevented:", e);
        }
      })
      .catch((e) => {
        console.warn("[Lenis] Failed to load module:", e);
      });

    return () => {
      isMounted = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (lenisInstance) {
        try {
          lenisInstance.destroy();
        } catch (e) {
          console.error("[Lenis] Destroy crash prevented:", e);
        }
        lenisInstance = null;
      }
    };
  }, []);

  return (
    <div className="bg-background min-h-[100vh] text-text-main font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MessengerWrapper />
    </div>
  );
}

import InsightsPage from "./features/insights/InsightsPage";
import ArticlePage from "./features/insights/ArticlePage";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function LangWrapper() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (lang && ['en', 'fr'].includes(lang)) {
      if (i18n.resolvedLanguage !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  if (lang && !['en', 'fr'].includes(lang)) {
    const defaultLang = i18n.resolvedLanguage || 'en';
    return <Navigate to={`/${defaultLang}${location.pathname}${location.search}${location.hash}`} replace />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnalyticsProvider>
          <SEO />
          <ErrorBoundary>
            <Routes>
              <Route path="/:lang" element={<LangWrapper />}>
                <Route
                  index
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <HomePage />
                    </Suspense>
                  }
                />
                <Route
                  path="about"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <AboutPage />
                    </Suspense>
                  }
                />
                
                <Route
                  path="insights"
                  element={
                    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                      <InsightsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="insights/:articleSlug"
                  element={
                    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                      <ArticlePage />
                    </Suspense>
                  }
                />
                <Route path="work" element={<Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}><WorkPage /></Suspense>} />
                <Route path="contact"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <ContactPage />
                    </Suspense>
                  }
                />
                <Route
                  path="services"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <ServicesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="services/:serviceId"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <ServicesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="locations/:region"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <LocationPage />
                    </Suspense>
                  }
                />
                <Route
                  path="industries/:industry"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <IndustryPage />
                    </Suspense>
                  }
                />
                <Route
                  path="case-studies/:caseId"
                  element={
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-background flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <CaseStudyPage />
                    </Suspense>
                  }
                />
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route
                    path="admin"
                    element={
                      <Suspense
                        fallback={
                          <div className="min-h-screen bg-background flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }
                      >
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="client-portal"
                    element={
                      <Suspense
                        fallback={
                          <div className="min-h-screen bg-background flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }
                      >
                        <ClientPortal />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>

              {/* Redirect any routes without lang prefix to preferred language */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </ErrorBoundary>
        </AnalyticsProvider>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

function NotFound() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || 'en';
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-display text-white mb-4">404</h1>
      <p className="text-text-muted text-lg mb-8">The page you are looking for does not exist or has been moved.</p>
      <a href={`/${lang}`} className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
        Return Home
      </a>
    </div>
  );
}

function RootRedirect() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || 'en';
  const location = useLocation();
  const { pathname, search, hash } = location;
  
  // If they are on a valid lang prefix but no route matched (e.g. /en/unknown-route),
  // they should see a 404, not be silently kicked back to the homepage.
  if (pathname.startsWith('/en/') || pathname === '/en' || pathname.startsWith('/fr/') || pathname === '/fr') {
     return <NotFound />;
  }

  // If they are at the root or missing a lang prefix, prefix it and redirect.
  // (e.g. /about -> /en/about)
  const newPath = pathname === '/' ? `/${lang}` : `/${lang}${pathname}`;
  return <Navigate to={`${newPath}${search}${hash}`} replace />;
}
