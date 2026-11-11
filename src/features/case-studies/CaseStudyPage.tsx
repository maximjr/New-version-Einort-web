import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { CheckCircle2 } from "lucide-react";
import { SEO } from "../../components/seo/SEO";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";

const caseStudiesData: Record<string, any> = {
  "global-logistics-erp": {
    title: "Global Logistics ERP",
    category: "ERP Solutions Dev",
    metric: "40% Efficiency Gain",
    timeline: "6 Months",
    industry: "Transportation & Logistics",
    overview:
      "A comprehensive supply chain and logistics management ERP system designed to centralize operations across five continents for a major freight forwarding company.",
    challenge:
      "The client was relying on fragmented, legacy AS400 systems and disconnected spreadsheets. Data latency was causing costly shipping delays, inventory mismatches, and poor customer visibility.",
    solution:
      "We engineered a custom, cloud-native ERP from the ground up using a microservices architecture. The platform features real-time container tracking, automated customs documentation, dynamic routing algorithms, and a comprehensive analytics dashboard for executives.",
    results: [
      "40% reduction in manual data entry.",
      "Real-time visibility achieved across 100% of active shipments.",
      "System latency reduced from 24 hours to sub-second responses.",
      "Saved over $2M annually in operational overhead.",
    ],
  },
  "fintech-mobile-app": {
    title: "FinTech Mobile App",
    category: "Mobile App Dev",
    metric: "$10M+ Monthly Volume",
    timeline: "4 Months",
    industry: "Financial Services",
    overview:
      "A secure, high-performance cross-platform mobile wallet and investment application tailored for the millennial demographic.",
    challenge:
      "The fast-growing fintech startup needed a mobile application that could handle high-frequency trading and secure fiat-to-crypto pipelines without compromising on user experience or security.",
    solution:
      "We built a robust mobile application using modern cross-platform frameworks, integrated with major banking APIs and secure hardware enclaves. The app includes biometric authentication, real-time market data streaming, and automated tax reporting.",
    results: [
      "Processed over $10M in transaction volume within the first month.",
      "Achieved a 99.99% uptime during market volatility peaks.",
      "Acquired 100k+ active users in the first quarter.",
      "Zero security breaches or compliance violations.",
    ],
  },
  "healthcare-portal": {
    title: "Healthcare Patient Portal",
    category: "Websites & Web App Dev",
    metric: "50k+ Active Users",
    timeline: "5 Months",
    industry: "Healthcare & Telemedicine",
    overview:
      "A secure, scalable web application offering scheduling, telehealth integrations, and patient access to electronic health records (EHR).",
    challenge:
      "The healthcare provider's legacy system was not HIPAA-compliant, suffered frequent crashes, and provided a frustrating user experience for both doctors and patients, leading to high no-show rates.",
    solution:
      "We designed and developed a unified patient portal with seamless integrations to their existing EHR. Features included one-click telehealth appointments, automated SMS reminders, secure messaging, and digital intake forms.",
    results: [
      "No-show rate decreased by 35%.",
      "Over 50,000 patients onboarded within the first 6 months.",
      "Administrative phone call volume dropped by 60%.",
      "Passed all rigorous HIPAA and SOC2 compliance audits seamlessly.",
    ],
  },
};

export function CaseStudyPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (caseId && caseStudiesData[caseId]) {
      setData(caseStudiesData[caseId]);
    }
  }, [caseId]);

  if (!data) {
    return (
      <div className="min-h-dvh pt-32 pb-24 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-display mb-4">Case Study Not Found</h1>
          <Link to="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh pt-32 pb-24 relative z-10 selection:bg-primary selection:text-white">
      <SEO 
        title={`${data.title} | Case Study | EINORT Solutions`}
        description={data.overview}
      />

      <Container>
        <article className="max-w-4xl mx-auto">
          <FadeUp>
            <nav className="mb-12">
              <Breadcrumbs 
                items={[
                  { label: "Home", href: "/" },
                  { label: "Case Studies" },
                  { label: data.title }
                ]} 
              />
            </nav>
          </FadeUp>

          <FadeUp delay={0.1}>
            <header className="flex flex-col gap-4 mb-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {data.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white leading-[1.1]">
                {data.title}
              </h1>
            </header>
          </FadeUp>

          <FadeUp delay={0.2}>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 border-y border-white/10 py-8">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">
                  Client Industry
                </h4>
                <p className="text-white font-medium">{data.industry}</p>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">
                  Timeline
                </h4>
                <time className="text-white font-medium">{data.timeline}</time>
              </div>
              <div className="col-span-2">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">
                  Key Metric
                </h4>
                <p className="text-primary font-bold">{data.metric}</p>
              </div>
            </section>
          </FadeUp>

          <div className="space-y-16 text-lg font-light leading-relaxed text-text-muted">
            <FadeUp delay={0.3}>
              <section>
                <h2 className="text-2xl font-medium text-white mb-6">
                  Project Overview
                </h2>
                <p>{data.overview}</p>
              </section>
            </FadeUp>

            <FadeUp delay={0.4}>
              <section>
                <h2 className="text-2xl font-medium text-white mb-6">
                  The Challenge
                </h2>
                <p>{data.challenge}</p>
              </section>
            </FadeUp>

            <FadeUp delay={0.5}>
              <section>
                <h2 className="text-2xl font-medium text-white mb-6">
                  Our Solution
                </h2>
                <p>{data.solution}</p>
              </section>
            </FadeUp>

            <FadeUp delay={0.6}>
              <section>
                <h2 className="text-2xl font-medium text-white mb-6">
                  Business Impact
                </h2>
                <div className="space-y-4">
                  {data.results.map((result: string, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <CheckCircle2
                        size={24}
                        className="text-primary shrink-0"
                      />
                      <span className="text-white">{result}</span>
                    </div>
                  ))}
                </div>
              </section>
            </FadeUp>
          </div>
        </article>
      </Container>
    </main>
  );
}
