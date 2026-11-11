
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Card } from "../../components/ui/Card";
import { ShieldCheck, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import { SEO } from "../../components/seo/SEO";
import { SITE_URL } from "../../constants/seo";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { getServiceById, servicesRegistry } from "../../config/services";

export function ServicesPage() {
  const { serviceId } = useParams();
  const { t, i18n } = useTranslation("services");
  
  const langPrefix = `/${i18n.resolvedLanguage || 'en'}`;
  const serviceConfig = serviceId ? getServiceById(serviceId) : undefined;

  if (!serviceId) {
    const catalogSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Einort Solutions Enterprise Services",
      "itemListElement": servicesRegistry.map((s, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": t(`items.${s.id}.title`),
        "url": `${SITE_URL}${langPrefix}/services/${s.id}`
      }))
    });

    return (
      <main className="min-h-dvh pt-32 pb-24 relative z-10 selection:bg-primary selection:text-white">
        <SEO schema={catalogSchema} />
        <Container>
          <nav className="mb-12">
            <Breadcrumbs items={[{ label: t("ui.home", "Home"), href: "/" }, { label: t("ui.services", "Services") }]} />
          </nav>
          
          <FadeUp>
            <div className="max-w-3xl mb-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4 inline-block">
                {t("badge", "Core Capabilities")}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6 leading-tight tracking-tight">
                Our Digital Services & Enterprise Engineering
              </h1>
              <p className="text-xl text-text-muted leading-relaxed font-light">
                We engineer custom web applications, bespoke ERP systems, mobile platforms, and high-performance digital growth solutions for forward-thinking enterprises in Cameroon and globally.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesRegistry.map((service, idx) => (
              <FadeUp key={service.id} delay={idx * 0.05}>
                <Link
                  to={`${langPrefix}/services/${service.id}`}
                  className="group block h-full p-8 rounded-3xl bg-surface/40 border border-white/5 hover:border-primary/40 hover:bg-surface/70 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-primary group-hover:scale-105 group-hover:bg-primary/10 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-display font-medium text-white mb-3 group-hover:text-primary transition-colors">
                    {t(`items.${service.id}.title`)}
                  </h2>
                  <p className="text-text-muted text-sm leading-relaxed mb-6 font-light">
                    {t(`items.${service.id}.valueProposition`)}
                  </p>
                  <div className="inline-flex items-center text-sm font-medium text-primary gap-2">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </Container>
      </main>
    );
  }

  if (!serviceConfig) {
    return (
      <Container className="py-32 text-center h-[70vh] flex flex-col justify-center items-center">
        <h1 className="text-4xl text-white font-display mb-4">{t("ui.not_found")}</h1>
        <p className="text-text-muted mb-8">The requested service could not be found or has been relocated.</p>
        <Link to={`${langPrefix}/services`} className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          View All Services
        </Link>
      </Container>
    );
  }

  // Fetch structured content
  const title = t(`items.${serviceId}.title`);
  const valueProposition = t(`items.${serviceId}.valueProposition`);
  const introduction = t(`items.${serviceId}.introduction`);
  const targetAudience = t(`items.${serviceId}.targetAudience`);
  const problemsSolved = t(`items.${serviceId}.problemsSolved`);
  const approach = t(`items.${serviceId}.approach`);
  const technology = t(`items.${serviceId}.technology`);
  const cameroonContext = t(`items.${serviceId}.cameroonContext`);
  
  const coreCapabilitiesRaw = t(`items.${serviceId}.coreCapabilities`, { returnObjects: true });
  const coreCapabilities = Array.isArray(coreCapabilitiesRaw) ? coreCapabilitiesRaw : [];
  
  const benefitsRaw = t(`items.${serviceId}.benefits`, { returnObjects: true });
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : [];
  
  const useCasesRaw = t(`items.${serviceId}.useCases`, { returnObjects: true });
  const useCases = Array.isArray(useCasesRaw) ? useCasesRaw : [];
  
  const industriesServedRaw = t(`items.${serviceId}.industriesServed`, { returnObjects: true });
  const industriesServed = Array.isArray(industriesServedRaw) ? industriesServedRaw : [];
  
  const processRaw = t(`items.${serviceId}.process`, { returnObjects: true });
  const processSteps = Array.isArray(processRaw) ? processRaw : [];
  
  const faqsRaw = t(`items.${serviceId}.faqs`, { returnObjects: true });
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];
  
  const relatedServicesRaw = t(`items.${serviceId}.relatedServices`, { returnObjects: true });
  const relatedServices = Array.isArray(relatedServicesRaw) ? relatedServicesRaw : [];

  const jsonLdSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": title !== `items.${serviceId}.title` ? title : "Service",
    "description": valueProposition !== `items.${serviceId}.valueProposition` ? valueProposition : "",
    "provider": {
      "@type": "Organization",
      "name": "Einort Solutions",
      "url": SITE_URL
    },
  });

  return (
    <>
      <SEO schema={jsonLdSchema} />
      <main className="pt-32 pb-24 min-h-screen">
        <Container>
          <div className="mb-8">
            <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: title }]} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <article className="lg:col-span-2 space-y-16">
              
              <FadeUp>
                <header>
                  <h1 className="text-4xl md:text-5xl font-display text-white mb-6 leading-tight">
                    {title}
                  </h1>
                  <p className="text-xl text-primary font-medium mb-6">
                    {valueProposition}
                  </p>
                  <div className="prose prose-invert max-w-none prose-p:text-text-muted prose-p:leading-relaxed prose-p:text-lg">
                    <p>{introduction}</p>
                  </div>
                </header>
              </FadeUp>

              <FadeUp delay={0.1}>
                <section>
                  <h2 className="text-2xl font-display text-white mb-4">Who This Is For</h2>
                  <p className="text-text-muted leading-relaxed mb-6">{targetAudience}</p>
                  
                  <h2 className="text-2xl font-display text-white mb-4">Business Problems Solved</h2>
                  <p className="text-text-muted leading-relaxed">{problemsSolved}</p>
                </section>
              </FadeUp>

              {coreCapabilities.length > 0 && (
                <FadeUp delay={0.2}>
                  <section>
                    <h2 className="text-2xl font-display text-white mb-6">Core Capabilities</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {coreCapabilities.map((cap: any, i: number) => (
                        <div key={i} className="bg-surface border border-white/5 p-6 rounded-2xl">
                          <h3 className="text-white font-medium mb-2">{cap.title}</h3>
                          <p className="text-sm text-text-muted">{cap.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </FadeUp>
              )}

              <FadeUp delay={0.3}>
                <section>
                  <h2 className="text-2xl font-display text-white mb-4">Our Approach & Technology</h2>
                  <p className="text-text-muted leading-relaxed mb-6">{approach}</p>
                  <p className="text-text-muted leading-relaxed">{technology}</p>
                </section>
              </FadeUp>

              
              {useCases.length > 0 && (
                <FadeUp delay={0.45}>
                  <section>
                    <h2 className="text-2xl font-display text-white mb-6">Common Use Cases</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {useCases.map((uc: any, i: number) => (
                        <div key={i} className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                          <h3 className="text-primary font-medium mb-2">{uc.title}</h3>
                          <p className="text-sm text-text-muted">{uc.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </FadeUp>
              )}

              {benefits.length > 0 && (
                <FadeUp delay={0.4}>
                  <section>
                    <h2 className="text-2xl font-display text-white mb-6">Key Benefits</h2>
                    <ul className="space-y-4">
                      {benefits.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                          <span className="text-text-muted">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </FadeUp>
              )}

              {processSteps.length > 0 && (
                <FadeUp delay={0.5}>
                  <section>
                    <h2 className="text-2xl font-display text-white mb-6">Implementation Process</h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {processSteps.map((step: any, i: number) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-background text-text-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                            <span className="text-xs font-semibold">{i + 1}</span>
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-surface/50">
                            <h3 className="text-white font-medium mb-1">{step.step}</h3>
                            <p className="text-sm text-text-muted">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </FadeUp>
              )}

              {faqs.length > 0 && (
                <FadeUp delay={0.6}>
                  <section>
                    <h2 className="text-2xl font-display text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {faqs.map((faq: any, i: number) => (
                        <div key={i} className="p-6 bg-surface border border-white/5 rounded-2xl">
                          <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                          <p className="text-text-muted text-sm">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </FadeUp>
              )}

              {serviceId === 'websites-web-apps' && (
                <FadeUp delay={0.7}>
                  <section>
                    <div className="mb-8">
                      <h2 className="text-2xl font-display text-white mb-4">Our Recent Web Dev Projects</h2>
                      <p className="text-text-muted font-light">Explore some of our latest enterprise and consumer web applications, built for scale and performance.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          name: "E-Commerce Platform",
                          type: "E-Commerce",
                          desc: "A scalable, high-performance online retail platform featuring secure payments, intuitive product discovery, and seamless checkout.",
                          image: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/Einort%2FChatGPT%20Image%20Aug%2011%2C%202026%2C%2011_13_35%20AM.png?alt=media&token=cb43ebff-61ff-4b2a-8649-9e2217b1e307",
                          link: "https://kbl-e-lectronics.vercel.app/",
                        },
                        {
                          name: "Premium Hotel Landing Page",
                          type: "PREMIUM HOTEL",
                          desc: "An elegant, high-conversion landing page for a premium hotel.",
                          image: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/Einort%2FScreenshot%202026-08-11%20195316.png?alt=media&token=bc8c3e6b-704c-4e89-9f86-0f4dc24828a7",
                          link: "https://kamojamas-hotel-zstz.vercel.app/",
                        },
                        {
                          name: "Fashion E-Shop Platform",
                          type: "FASHION E-SHOP",
                          desc: "A modern e-commerce storefront for fashion and accessories.",
                          image: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/Einort%2FScreenshot%202026-08-11%20170344.png?alt=media&token=91b01adf-fbfb-48bf-b75c-93bf02f643e2",
                          link: "https://jo-accessories-1.vercel.app/",
                        },
                        {
                          name: "Apple E-Commerce Store",
                          type: "E-COMMERCE",
                          desc: "A sleek, high-performance online storefront for Apple products and electronics.",
                          image: "https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/NOVA%2FScreenshot%202026-08-13%20210038.png?alt=media&token=697dedb2-0603-4dc9-94b9-5d85ceb8cefb",
                          link: "https://novantelecom.vercel.app/",
                        }
                      ].map((project, idx) => {
                        const CardWrapper = project.link ? 'a' : 'div';
                        const linkProps = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};
                        
                        return (
                        <CardWrapper key={idx} {...linkProps} className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-background/50 hover:bg-white/[0.02] transition-colors block">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={project.image} 
                              alt={project.name} 
                              loading="lazy"
                              decoding="async"
                              width="800"
                              height="600"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />
                          </div>
                          <div className="p-6">
                            <p className="text-primary text-xs uppercase tracking-wider font-semibold mb-2">{project.type}</p>
                            <h3 className="text-xl text-white font-medium mb-2">{project.name}</h3>
                            <p className="text-text-muted font-light text-sm">{project.desc}</p>
                          </div>
                        </CardWrapper>
                      )})}
                    </div>
                  </section>
                </FadeUp>
              )}

              {cameroonContext && cameroonContext !== `items.${serviceId}.cameroonContext` && (
                <FadeUp delay={0.8}>
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl italic text-text-muted"> 
                    {cameroonContext}
                  </div>
                </FadeUp>
              )}

            </article>

            <aside className="col-span-1">
              <FadeUp delay={0.4}>
                <div className="sticky top-32 space-y-8">
                  <Card className="bg-surface border-white/5 p-8">
                    <h3 className="text-white font-display text-lg mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" /> Start a Project
                    </h3>
                    <p className="text-sm text-text-muted mb-6 font-light">
                      Ready to elevate your enterprise? Speak with our architecture team to discuss your requirements.
                    </p>
                    <div className="space-y-4">
                      <Link to={`${langPrefix}/contact`} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors">
                        Request Consultation <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                      <a href="https://wa.me/message/52SRSBT3VZXQB1" target="_blank" rel="noopener noreferrer" className="w-full border border-white/10 hover:bg-white/5 text-white font-medium py-3 rounded-lg flex items-center justify-center transition-colors">
                        Chat Via WhatsApp
                      </a>
                    </div>
                  </Card>

                  {industriesServed.length > 0 && (
                    <Card className="bg-surface border-white/5 p-8">
                      <h3 className="text-white font-display text-lg mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" /> Industries Served
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {industriesServed.map((industry: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-text-muted">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {relatedServices.length > 0 && (
                    <Card className="bg-surface border-white/5 p-8">
                      <h3 className="text-white font-display text-lg mb-4">Related Services</h3>
                      <ul className="space-y-3">
                        {relatedServices.map((relId: string, i: number) => {
                          const relService = servicesRegistry.find(s => s.id === relId);
                          if (!relService) return null;
                          return (
                            <li key={i}>
                              <Link to={`${langPrefix}/services/${relId}`} className="flex items-center text-sm text-text-muted hover:text-primary transition-colors group">
                                <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {t(`items.${relId}.title`, { defaultValue: relId })}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  )}
                </div>
              </FadeUp>
            </aside>
          </div>
        </Container>
      </main>
    </>
  );
}
