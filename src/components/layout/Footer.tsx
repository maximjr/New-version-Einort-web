import { Container } from "./Container";
import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { useTranslation } from "react-i18next";
import { SOCIAL_LINKS } from "../../config/socialLinks";
import { AnalyticsService } from "../../lib/analytics";

export function Footer() {
  const { t } = useTranslation("footer");
  const { i18n } = useTranslation();
  const langPrefix = `/${i18n.resolvedLanguage || 'en'}`;

  return (
    <footer className="bg-background pt-24 pb-12 border-t border-white/5 relative z-10">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 border-b border-white/5 pb-20 mb-12">
          <div className="md:col-span-1 border-r border-white/5 pr-8">
            <Link to={langPrefix || "/"} className="flex items-center gap-3 group mb-8">
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
            <p className="text-sm text-text-muted leading-relaxed max-w-xs font-light mb-8">
              {t("description")}
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  onClick={() => AnalyticsService.trackSocialClick({ network: link.name })}
                  className={`text-slate-500 transition-colors duration-300 ${link.hoverColor}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              {t("services")}
            </h4>
            <ul className="space-y-4 text-sm text-text-muted font-light">
              <li>
                <Link
                  to={`${langPrefix}/services/websites-web-apps`}
                  className="hover:text-primary transition-colors"
                >
                  {t("websites_web_apps")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/services/ui-ux-design`}
                  className="hover:text-primary transition-colors"
                >
                  {t("ui_ux_design")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/services/erp-solutions`}
                  className="hover:text-primary transition-colors"
                >
                  {t("erp_solutions")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/services/mobile-app-development`}
                  className="hover:text-primary transition-colors"
                >
                  {t("mobile_app_development")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/services`}
                  className="hover:text-primary transition-colors font-normal text-slate-300"
                >
                  {t("all_services", "All Services & Capabilities →")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              {t("industries")}
            </h4>
            <ul className="space-y-4 text-sm text-text-muted font-light">
              <li>
                <Link
                  to={`${langPrefix}/industries/healthcare`}
                  className="hover:text-primary transition-colors"
                >
                  {t("healthcare")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/industries/finance`}
                  className="hover:text-primary transition-colors"
                >
                  {t("finance")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/industries/real-estate`}
                  className="hover:text-primary transition-colors"
                >
                  {t("real_estate")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/industries/retail`}
                  className="hover:text-primary transition-colors"
                >
                  {t("retail_smes")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">
              {t("company")}
            </h4>
            <ul className="space-y-4 text-sm text-text-muted font-light">
              <li>
                <Link
                  to={`${langPrefix}/about`}
                  className="hover:text-primary transition-colors"
                >
                  {t("about_us", "About Us")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/work`}
                  className="hover:text-primary transition-colors"
                >
                  {t("case_studies_work", "Our Work & Case Studies")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/insights`}
                  className="hover:text-primary transition-colors"
                >
                  {t("insights_blog", "Insights & Articles")}
                </Link>
              </li>
              <li>
                <Link
                  to={`${langPrefix}/contact`}
                  className="hover:text-primary transition-colors"
                >
                  {t("contact_us")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <p>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-4">
            <span className="opacity-70">
              {t("serving")}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
