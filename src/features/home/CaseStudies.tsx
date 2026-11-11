import { Link } from "react-router-dom";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { ArrowRight, BarChart, Smartphone, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CaseStudies() {
  const { t, i18n } = useTranslation('case_studies');
  const langPrefix = `/${i18n.resolvedLanguage || 'en'}`;

  const studies = [
    {
      id: "global-logistics-erp",
      icon: <BarChart className="w-6 h-6 text-primary" />,
    },
    {
      id: "fintech-mobile-app",
      icon: <Smartphone className="w-6 h-6 text-primary" />,
    },
    {
      id: "healthcare-portal",
      icon: <Globe className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section id="case-studies" className="py-24 bg-surface z-10 relative">
      <Container>
        <div className="flex flex-col gap-4 text-center mb-16 max-w-3xl mx-auto">
          <FadeUp>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {t("badge")}
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white leading-[1.1]">
              {t("title")}
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg text-text-muted font-light mt-4">
              {t("description")}
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {studies.map((study, index) => (
            <FadeUp key={study.id} delay={0.1 * (index + 2)}>
              <div className="bg-background border border-white/5 rounded-2xl p-8 h-full flex flex-col hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-primary">
                  {study.icon}
                </div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80 mb-3">
                  {t(`items.${study.id}.category`)}
                </div>
                <h3 className="text-2xl font-medium text-white mb-4">
                  {t(`items.${study.id}.title`)}
                </h3>
                <p className="text-text-muted font-light leading-relaxed mb-8 flex-grow">
                  {t(`items.${study.id}.description`)}
                </p>
                <div className="mt-auto">
                  <Link
                    to={`${langPrefix}/case-studies/${study.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-primary transition-colors"
                  >
                    {t("view_case_study")}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
