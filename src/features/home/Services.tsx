import React from "react";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Database, Smartphone, LayoutTemplate, Code2, PenTool, Share2, Target, Search } from "lucide-react";

const services = [
  {
    id: "websites-web-apps",
    icon: <Code2 className="w-6 h-6 text-primary" />,
  },
  {
    id: "ui-ux-design",
    icon: <LayoutTemplate className="w-6 h-6 text-primary" />,
  },
  {
    id: "erp-solutions",
    icon: <Database className="w-6 h-6 text-primary" />,
  },
  {
    id: "mobile-app-development",
    icon: <Smartphone className="w-6 h-6 text-primary" />,
  },
  {
    id: "branding-graphic-design",
    icon: <PenTool className="w-6 h-6 text-primary" />,
  },
  {
    id: "social-media-management",
    icon: <Share2 className="w-6 h-6 text-primary" />,
  },
  {
    id: "digital-advertising",
    icon: <Target className="w-6 h-6 text-primary" />,
  },
  {
    id: "seo-google-workspace",
    icon: <Search className="w-6 h-6 text-primary" />,
  },
];

export function Services() {
  const { t, i18n } = useTranslation('services');
  const langPrefix = `/${i18n.resolvedLanguage || 'en'}`;

  return (
    <section
      id="services"
      className="py-24 bg-surface z-10 relative border-t border-white/5"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <FadeUp>
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {t("badge")}
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white max-w-2xl leading-[1.1]">
                {t("title_part_1")} <br /> {t("title_part_2")}
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-text-muted max-w-md text-base leading-relaxed font-light">
              {t("description")}
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <FadeUp key={index} delay={0.1 * index}>
              <Link to={`${langPrefix}/services/${service.id}`} className="block h-full cursor-pointer">
                <Card className="h-full bg-background/50 border-white/5 hover:border-white/10 hover:bg-background/80 transition-all duration-500 group">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface/50 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-[1.05] group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500 shadow-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {React.cloneElement(
                        service.icon as React.ReactElement<any>,
                        {
                          className:
                            "w-6 h-6 text-primary group-hover:text-primary transition-colors duration-500",
                        },
                      )}
                    </div>
                    <CardTitle className="text-2xl font-display font-medium text-white tracking-wide">
                      {t(`items.${service.id}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-muted leading-relaxed font-light text-[15px]">
                      {t(`items.${service.id}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
