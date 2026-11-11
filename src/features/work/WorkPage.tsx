import { SEO } from "../../components/seo/SEO";
import { FadeUp } from "../../components/animations/FadeUp";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const caseStudies = [
  {
    id: "fintech-mobile-app",
    title: "Fintech App for Cameroonian Market",
    category: "Mobile App Development",
    desc: "A secure, robust mobile application integrating local Mobile Money payment gateways for seamless transactions.",
  },
  {
    id: "global-logistics-erp",
    title: "Custom ERP for Logistics in Douala",
    category: "ERP Solutions",
    desc: "An end-to-end fleet and inventory management system improving operational efficiency by 40%.",
  },
  {
    id: "healthcare-portal",
    title: "B2B E-commerce Platform",
    category: "Websites & Web Apps",
    desc: "A high-performance B2B marketplace connecting local wholesalers with retailers across Cameroon.",
  }
];

export default function WorkPage() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || 'en';

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEO 
        title="Our Work & Case Studies | EINORT Solutions" 
        description="Explore EINORT Solutions' portfolio of successful digital transformations, custom software, and ERP implementations for businesses in Cameroon and Africa." 
      />

      <FadeUp>
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-display text-white mb-6">Our Work</h1>
          <p className="text-xl text-text-muted leading-relaxed">
            Discover how we have partnered with businesses across Cameroon to deliver scalable software solutions, mobile applications, and enterprise systems that drive real growth.
          </p>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {caseStudies.map((study, idx) => (
          <FadeUp key={study.id} delay={idx * 0.1}>
            <Link to={`/${lang}/case-studies/${study.id}`} className="block h-full p-8 rounded-3xl bg-surface/30 border border-white/5 hover:bg-surface/50 transition-colors">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">{study.category}</div>
              <h2 className="text-2xl font-display text-white mb-4">{study.title}</h2>
              <p className="text-text-muted">{study.desc}</p>
            </Link>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
