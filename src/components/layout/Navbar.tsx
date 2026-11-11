import { useState, useEffect } from "react";
import { lazyWithRetry } from "../../lib/lazyWithRetry";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  FolderGit2,
  LifeBuoy,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "./Container";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Logo } from "../ui/Logo";
import { Loadable } from "../shared/Loadable";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SOCIAL_LINKS } from "../../config/socialLinks";

const AuthModal = Loadable(
  lazyWithRetry(() =>
    import("../../features/auth/AuthModal").then((m) => ({
      default: m.AuthModal,
    })),
  ),
  () => null // AuthModal should fade-in natively without a spinner
);

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Insights", href: "/insights" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const { t, i18n } = useTranslation('navbar');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const langPrefix = `/${i18n.resolvedLanguage || 'en'}`;

  const handleNavClick = (path: string) => {
    // Make sure we handle hash links correctly or prepend langPrefix if absolute
    let finalPath = path;
    if (path.startsWith('/') && !path.startsWith(langPrefix)) {
      const pathWithoutLang = path.replace(/^\/(en|fr)(?=\/|$)/, '');
      finalPath = `${langPrefix}${pathWithoutLang.startsWith('/') ? '' : '/'}${pathWithoutLang}`;
    }
    
    navigate(finalPath);
    setMobileMenuOpen(false);
  };

  const prefetchRoute = (path: string) => {
    if (path.includes("admin")) {
      import("../../features/admin/AdminDashboard").catch(() => {});
    } else if (path.includes("client-portal")) {
      import("../../features/client-portal/ClientPortal").catch(() => {});
    } else if (path.includes("services")) {
      import("../../features/services/ServicesPage").catch(() => {});
    } else if (path.includes("industries")) {
      import("../../features/seo/IndustryPage").catch(() => {});
    } else if (path.includes("locations")) {
      import("../../features/seo/LocationPage").catch(() => {});
    }
  };

  const handleSignOut = async () => {
    try {
      const { auth } = await import("../../lib/firebase");
      const { signOut } = await import("firebase/auth");
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Failed to sign out", e);
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash scrolling when coming from another page
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      openAuth(e.detail?.mode || "login");
    };
    window.addEventListener("open-auth", handleOpenAuth);
    return () => window.removeEventListener("open-auth", handleOpenAuth);
  }, []);

  const { lock, unlock } = useScrollLock();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      lock();
    } else {
      unlock();
    }
    return () => {
      unlock();
    };
  }, [mobileMenuOpen, lock, unlock]);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/70 backdrop-blur-md border-b border-white/5 py-4 shadow-2xl"
            : "bg-transparent py-6"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="touch-manipulation flex items-center gap-3 group">
                <Logo className="w-10 h-10 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-500" />
                <div className="flex flex-col">
                  <span className="text-xl font-display font-bold uppercase tracking-widest text-white leading-none">
                    Einort
                  </span>
                  <span className="text-[9px] font-display font-bold uppercase tracking-[0.3em] text-primary mt-1">
                    Solutions
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={`${langPrefix}${link.href}`}
                  className="touch-manipulation text-[13px] font-medium tracking-[0.1em] uppercase text-text-muted hover:text-white transition-colors relative group"
                >
                  {t(link.name.toLowerCase().replace(" ", "_"))}
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link
                    to={
                      userData?.role === "admin" ||
                      userData?.role === "super_admin" ||
                      userData?.isAdmin
                        ? `${langPrefix}/admin`
                        : `${langPrefix}/client-portal`
                    }
                    onMouseEnter={() => prefetchRoute(
                      userData?.role === "admin" ||
                      userData?.role === "super_admin" ||
                      userData?.isAdmin
                        ? "/admin"
                        : "/client-portal"
                    )}
                    className="touch-manipulation text-[13px] font-bold tracking-[0.1em] uppercase text-text-muted hover:text-white transition-colors flex items-center gap-2 focus:outline-none"
                  >
                    <User size={16} className="text-primary" /> {t("dashboard")}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-manipulation font-bold text-[11px] tracking-[0.15em] uppercase px-4 border-white/10 hover:bg-white/5"
                    onClick={handleSignOut}
                  >
                    <LogOut size={14} className="mr-2" /> {t("sign_out")}
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className="touch-manipulation text-[13px] font-bold tracking-[0.1em] uppercase text-text-muted hover:text-white transition-colors flex items-center gap-2 focus:outline-none"
                  >
                    <LogIn size={16} className="text-primary" /> {t("login")}
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="touch-manipulation font-bold text-[11px] tracking-[0.15em] uppercase px-6"
                    onClick={() => openAuth("register")}
                  >
                    {t("start_project")}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              className="touch-manipulation lg:hidden text-text-muted hover:text-white focus:outline-none flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors relative z-[60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Menu
                  size={24}
                  className={`absolute transition-all duration-300 ${mobileMenuOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}
                />
                <X
                  size={24}
                  className={`absolute transition-all duration-300 ${mobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`}
                />
              </div>
            </button>
          </div>
        </Container>
      </header>

      {/* Premium Mobile Nav Drawer (iOS-style Bottom Sheet) */}
      <>
        {/* Overlay / Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px] lg:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
          style={{ willChange: "opacity" }}
        />

        {/* Drawer Sheet */}
        <div
          className={`fixed inset-x-0 bottom-0 z-[55] h-[92vh] bg-[#090b10] border-t border-white/5 rounded-t-[2.5rem] lg:hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileMenuOpen
              ? "shadow-[0_-30px_100px_rgba(0,0,0,0.8)] pointer-events-auto"
              : "shadow-none pointer-events-none"
          }`}
          style={{ 
            willChange: "transform",
            transform: mobileMenuOpen ? "translate3d(0, 0, 0)" : "translate3d(0, 130%, 0)"
          }}
          aria-hidden={!mobileMenuOpen}
        >
          {/* Premium Ambience Glow (No expensive backdrop blur) */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent pointer-events-none rounded-t-[2.5rem]" />

          {/* Static Indicator */}
          <div className="w-full flex justify-center py-4 shrink-0">
            <div className="w-12 h-1.5 bg-white/[0.15] rounded-full"></div>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto px-6 pb-[max(3rem,env(safe-area-inset-bottom,3rem))] pt-2 scrollbar-none overscroll-contain z-10 relative" data-lenis-prevent="true">
            {user ? (
              <>
                {/* TOP: Profile Section */}
                <div className="flex items-center gap-4 mb-8 bg-white/[0.03] border border-white/10 rounded-3xl p-4 shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-inner relative shrink-0">
                    {userData?.fullName?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0b0f19]"></div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white font-display font-medium text-lg truncate">
                      {userData?.fullName || t("authenticated_user")}
                    </span>
                    <span className="text-primary font-mono text-[10px] uppercase tracking-widest mt-0.5 truncate">
                      {userData?.role === "super_admin"
                        ? t("roles.super_admin")
                        : userData?.role === "admin"
                          ? t("roles.admin")
                          : t("roles.client")}
                    </span>
                  </div>
                  <div className="shrink-0 pl-2 border-l border-white/10">
                    <LanguageSwitcher />
                  </div>
                </div>

                {/* MIDDLE: High Priority Actions */}
                <div className="mb-8 space-y-2">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 mb-3">
                    {t("command_center")}
                  </p>

                  <button
                    onMouseEnter={() => prefetchRoute(
                      userData?.role === "admin" ||
                      userData?.role === "super_admin" ||
                      userData?.isAdmin
                        ? "/admin"
                        : "/client-portal"
                    )}
                    onClick={() =>
                      handleNavClick(
                        userData?.role === "admin" ||
                          userData?.role === "super_admin"
                          ? "/admin"
                          : "/client-portal",
                      )
                    }
                    className="touch-manipulation w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] active:bg-white/[0.1] active:opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <LayoutDashboard size={18} strokeWidth={2.5} />
                      </div>
                      <span className="font-medium text-white text-base tracking-wide">
                        {t("dashboard")}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleNavClick(
                          userData?.role === "admin" ||
                            userData?.role === "super_admin"
                            ? "/admin#projects"
                            : "/client-portal#projects",
                        )
                      }
                      className="touch-manipulation flex flex-col items-start p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] active:bg-white/[0.1] active:opacity-80 gap-3"
                    >
                      <FolderGit2 size={18} className="text-emerald-400" />
                      <span className="font-medium text-white text-sm tracking-wide">
                        {t("projects")}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        handleNavClick(
                          userData?.role === "admin" ||
                            userData?.role === "super_admin"
                            ? "/admin#messages"
                            : "/client-portal#messages",
                        )
                      }
                      className="touch-manipulation flex flex-col items-start p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl transition-all duration-300 ease-out active:scale-[0.96] active:bg-white/[0.1] active:opacity-80 gap-3 relative"
                    >
                      <MessageSquare size={18} className="text-cyan-400" />
                      <span className="font-medium text-white text-sm tracking-wide">
                        {t("messages")}
                      </span>
                      {/* Example badge */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Logged out Top section
              <div className="mb-8 mt-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-display font-medium text-white tracking-tight">
                    {t("welcome")}
                  </h2>
                  <LanguageSwitcher />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 block">
                  {t("sign_in_desc")}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="touch-manipulation flex-1 h-14 rounded-2xl font-bold tracking-wider text-xs shadow-[0_4px_20px_rgba(10,102,194,0.3)] uppercase"
                    onClick={() => openAuth("register")}
                  >
                    {t("start_project")}
                  </Button>
                  <Button
                    variant="outline"
                    className="touch-manipulation flex-1 h-14 rounded-2xl font-bold tracking-wider text-xs border-white/10 text-white hover:bg-white/5 uppercase"
                    onClick={() => openAuth("login")}
                  >
                    {t("login")}
                  </Button>
                </div>
              </div>
            )}

            {/* SECONDARY: Navigation Links */}
            <div className="mb-8 space-y-1">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 mb-3">
                {t("navigation")}
              </p>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden p-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="touch-manipulation w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 ease-out active:scale-[0.96] active:bg-white/[0.1] active:opacity-80"
                  >
                    <span className="font-medium text-white text-[15px] tracking-wide">
                      {t(link.name.toLowerCase().replace(" ", "_"))}
                    </span>
                    <ChevronRight size={16} className="text-slate-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* BOTTOM: Utilities */}
            <div className="mt-auto space-y-3 pt-6 pb-6 border-t border-white/[0.05]">
              <button
                onClick={() => handleNavClick("/support")}
                className="touch-manipulation w-full flex items-center justify-between px-4 py-3 font-medium bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all duration-300 ease-out border border-white/5 active:scale-[0.96] active:bg-white/[0.08]"
              >
                <span className="text-sm text-slate-300 flex items-center gap-3">
                  <LifeBuoy size={16} className="text-slate-400" /> {t("professional_support")}
                </span>
                <ChevronRight size={16} className="text-slate-600" />
              </button>

              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="touch-manipulation w-full flex justify-center items-center gap-2 h-14 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold tracking-widest text-[11px] uppercase rounded-2xl transition-all duration-300 ease-out border border-red-500/10 active:scale-[0.96] active:bg-red-500/20 active:opacity-80"
                >
                  <LogOut size={14} />
                  {t("sign_out")}
                </button>
              )}
            </div>

            {/* BOTTOM: Social Icons */}
            <div className="flex justify-center items-center gap-6 pb-8 pt-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className={`touch-manipulation text-slate-400 transition-colors duration-300 ${link.hoverColor}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </>

      {/* Auth Modal Portal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
        />
      )}
    </>
  );
}
