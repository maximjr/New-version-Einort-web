import { SOCIAL_LINKS } from "../../config/socialLinks";
import { FadeUp } from "../animations/FadeUp";
import { useTranslation } from "react-i18next";

export function SocialMediaSection() {
  const { t } = useTranslation();
  return (
    <section className="py-12 border-t border-white/10">
      <FadeUp>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display text-white mb-3">
            {t("social.connect_title", "Connect With EINORT Solutions")}
          </h2>
          <p className="text-text-muted font-light max-w-2xl mx-auto">
            {t(
              "social.connect_description",
              "Follow EINORT Solutions for software updates, technology insights, ERP development, AI innovation, digital transformation, company announcements, and business tips."
            )}
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className={`flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white transition-all duration-300 hover:scale-110 hover:bg-white/10 ${link.hoverColor} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
