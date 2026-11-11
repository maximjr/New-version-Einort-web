import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { SEO } from "../../components/seo/SEO";
import { SEO_CONFIG } from "../../constants/seo";
import { SocialMediaSection } from "../../components/shared/SocialMediaSection";
import { SOCIAL_LINKS } from "../../config/socialLinks";

export function AboutPage() {
  return (
    <>
      <SEO 
        title="About Einort Solutions | Enterprise Software Engineering"
        description="Learn about Einort Solutions, a premier software engineering agency based in Douala, Cameroon. Discover our mission, vision, tech stack, and enterprise philosophy."
        schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            ...SEO_CONFIG.organizationSchema,
            sameAs: SOCIAL_LINKS.map(link => link.url)
          }
        })}
      />
      
      <main className="pt-32 pb-24 bg-background min-h-dvh relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 blur-[120px] pointer-events-none rounded-full -translate-x-1/2 translate-y-1/3"></div>
        
        <Container className="relative z-10">
          <header className="max-w-4xl mx-auto text-center mb-24">
            <FadeUp>
              <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6 leading-tight tracking-tight">
                Engineering <span className="text-primary">Enterprise</span> Excellence
              </h1>
              <p className="text-lg md:text-xl text-text-muted font-light leading-relaxed max-w-2xl mx-auto">
                Einort Solutions is a premier software architecture and engineering firm dedicated to building scalable, high-performance digital ecosystems for forward-thinking organizations.
              </p>
            </FadeUp>
          </header>

          <div className="max-w-4xl mx-auto space-y-24">
            {/* Mission & Vision */}
            <section>
              <FadeUp delay={0.1}>
                <div className="grid md:grid-cols-2 gap-12">
                  <article className="bg-surface border border-white/5 p-8 rounded-2xl">
                    <h2 className="text-2xl font-display text-white mb-4">Our Mission</h2>
                    <p className="text-text-muted font-light leading-relaxed">
                      To empower enterprises across Africa and globally by architecting robust, intelligent, and scalable software solutions that drive operational efficiency and sustainable growth.
                    </p>
                  </article>
                  <article className="bg-surface border border-white/5 p-8 rounded-2xl">
                    <h2 className="text-2xl font-display text-white mb-4">Our Vision</h2>
                    <p className="text-text-muted font-light leading-relaxed">
                      To be the definitive leader in enterprise digital transformation, setting the benchmark for software engineering quality, AI integration, and architectural brilliance on the continent.
                    </p>
                  </article>
                </div>
              </FadeUp>
            </section>

            {/* Core Values */}
            <section>
              <FadeUp delay={0.2}>
                <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Core Values & Engineering Philosophy</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Architectural Rigor", desc: "We build systems designed to scale from day one, emphasizing clean code, microservices, and decoupled infrastructures." },
                    { title: "Security by Design", desc: "Enterprise-grade security is not an afterthought; it is woven into the fabric of every application we deploy." },
                    { title: "AI-First Thinking", desc: "We leverage artificial intelligence and machine learning to automate workflows, extract insights, and create predictive systems." },
                    { title: "Client-Centricity", desc: "We partner with our clients, treating their business challenges as our own engineering problems to solve." },
                    { title: "Relentless Innovation", desc: "We continuously research and adopt the bleeding edge of web technologies, cloud platforms, and data sciences." },
                    { title: "Quality Assurance", desc: "Rigorous automated testing, CI/CD pipelines, and manual code reviews ensure zero-defect deployments." }
                  ].map((value, idx) => (
                    <div key={idx} className="p-6 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <h3 className="text-lg font-medium text-white mb-3">{value.title}</h3>
                      <p className="text-sm text-text-muted font-light leading-relaxed">{value.desc}</p>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </section>

            {/* Tech Stack */}
            <section>
              <FadeUp delay={0.3}>
                <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Our Technology Stack</h2>
                <div className="prose prose-invert max-w-none text-text-muted font-light leading-relaxed">
                  <p className="mb-6">
                    Our architectural choices are driven by performance, scalability, and maintainability. We utilize a modern, cloud-native stack to deliver robust applications.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS, Framer Motion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span><strong>Backend & APIs:</strong> Node.js, Express, Python, GraphQL, RESTful Architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span><strong>Database & Data:</strong> PostgreSQL, MongoDB, Firebase/Firestore, Redis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span><strong>Cloud & DevOps:</strong> Google Cloud Platform (GCP), AWS, Docker, Kubernetes, GitHub Actions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                      <span><strong>AI & Automation:</strong> OpenAI API, Google Gemini, TensorFlow, LangChain</span>
                    </li>
                  </ul>
                </div>
              </FadeUp>
            </section>

            {/* Business Automation & ERP */}
            <section>
              <FadeUp delay={0.4}>
                <h2 className="text-3xl font-display text-white mb-8 border-b border-white/10 pb-4">Our Vision for Enterprise ERP</h2>
                <div className="prose prose-invert max-w-none text-text-muted font-light leading-relaxed">
                  <p>
                    We believe that modern enterprises require more than just off-the-shelf software; they need bespoke digital nervous systems. Our custom ERP and business automation solutions are designed to eliminate data silos, streamline cross-departmental workflows, and provide real-time, actionable intelligence to decision-makers.
                  </p>
                  <p className="mt-4">
                    By integrating AI-driven analytics and cloud-native architecture, we transform legacy operations into agile, data-driven powerhouses capable of adapting to rapid market changes.
                  </p>
                </div>
              </FadeUp>
            </section>

            {/* Social Media */}
            <SocialMediaSection />
          </div>
        </Container>
      </main>
    </>
  );
}
