import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { SEO } from "../../components/seo/SEO";
import { Globe, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LocationPage() {
  const { region } = useParams<{ region: string }>();
  const { t } = useTranslation("seo");

  const regionKey = region || "global";
  const localizedRegion = t(`names.${regionKey}`) !== `names.${regionKey}`
    ? t(`names.${regionKey}`)
    : regionKey.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${localizedRegion} Web Development`,
    provider: {
      "@type": "Organization",
      name: "Einort Solutions",
    },
    areaServed: {
      "@type": "Place",
      name: localizedRegion,
    },
    description: t("location.description_template", { region: localizedRegion }),
  });

  return (
    <>
      <SEO 
        title={t("location.title_template", { region: localizedRegion })}
        description={t("location.description_template", { region: localizedRegion })}
        schema={schema} 
      />
      <section className="pt-32 pb-24 bg-surface min-h-[80vh] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

        <Container>
          <div className="mb-10 max-w-4xl mx-auto">
            <Breadcrumbs 
              items={[
                { label: "Home", href: "/" },
                { label: "Locations" },
                { label: localizedRegion }
              ]} 
            />
          </div>
          <div className="max-w-4xl mx-auto border-l-2 border-primary/20 pl-6 md:pl-10 relative">
            <div className="absolute -left-[2px] top-0 w-[2px] h-32 bg-gradient-to-b from-primary to-transparent"></div>

            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                <Globe size={14} className="text-primary" />
                <span className="text-xs uppercase tracking-widest font-bold text-primary">
                  {t("location.services_badge", { region: localizedRegion })}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight mb-8 leading-tight">
                {t("location.hero_title")}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 block mt-2">
                  {t("location.hero_title_accent", { region: localizedRegion })}
                </span>
              </h1>
              <p className="text-xl text-slate-400 font-light max-w-2xl leading-relaxed mb-10">
                {t("location.hero_description", { region: localizedRegion })}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/#contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="gap-2 uppercase text-xs tracking-widest font-bold"
                  >
                    {t("location.schedule_discovery")} <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="uppercase text-xs tracking-widest font-bold text-slate-300"
                  >
                    {t("location.explore_global")}
                  </Button>
                </Link>
              </div>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            {[
              {
                icon: <Zap size={24} />,
                title: t("location.features.architecture_title"),
                desc: t("location.features.architecture_desc", { region: localizedRegion }),
              },
              {
                icon: <ShieldCheck size={24} />,
                title: t("location.features.secure_title"),
                desc: t("location.features.secure_desc", { region: localizedRegion }),
              },
              {
                icon: <Globe size={24} />,
                title: t("location.features.expertise_title"),
                desc: t("location.features.expertise_desc", { region: localizedRegion }),
              },
            ].map((feature, i) => (
              <FadeUp key={i} delay={0.2 + i * 0.1}>
                <Card className="p-8 h-full bg-background/50 border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-light text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
