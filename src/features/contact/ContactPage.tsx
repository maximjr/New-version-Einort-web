import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { SEO } from "../../components/seo/SEO";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { ProjectOrchestrator } from "../services/projectOrchestrator";
import { useAuth } from "../../hooks/useAuth";
import { SocialMediaSection } from "../../components/shared/SocialMediaSection";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Globe2,
  HeadphonesIcon,
  ChevronDown,
  Building2
} from "lucide-react";


// --- Schema ---
const contactSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  country: z.string().min(2, "Country is required"),
  industry: z.string().min(2, "Business industry is required"),
  subject: z.string().min(2, "Subject is required"),
  projectType: z.string().min(1, "Please select a service"),
  requirements: z.string().min(10, "Please provide more details about your inquiry"),
  preferredContact: z.string().min(1, "Please select a preferred contact method"),
  consent: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const servicesList = [
  "EINORT ERP",
  "Custom Software",
  "Website Development",
  "Mobile App",
  "UI/UX Design",
  "Branding",
  "AI Solutions",
  "Digital Marketing",
  "Business Automation",
  "IT Consulting",
  "Other"
];

// --- Components ---
import { AnalyticsService } from "../../lib/analytics";

export function ContactPage() {
  const { t } = useTranslation("contact_page");
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successContact, setSuccessContact] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      clientName: "",
      company: "",
      email: "",
      phone: "",
      country: "",
      industry: "",
      subject: "",
      projectType: "",
      requirements: "",
      preferredContact: "email",
      consent: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await ProjectOrchestrator.submitProject({
        userId: user?.uid || "anonymous",
        email: data.email,
        clientName: data.clientName,
        company: data.company,
        industry: data.industry,
        projectType: data.projectType,
        selectedFeatures: [data.subject, `Country: ${data.country}`, `Phone: ${data.phone}`, `Preferred Contact: ${data.preferredContact}`],
        requirements: data.requirements,
        budget: "TBD",
        timeline: "TBD",
        urgency: "flexible",
        status: "pending",
      });

      if (result.success) {
        if (data.preferredContact === "whatsapp") { setSuccessContact("whatsapp"); } else { setSuccessContact(null); }
        setIsSuccess(true);
        reset();
      } else {
        setSubmitError(result.message || t("form.error", "An error occurred submitting your request."));
      }
    } catch (error) {
      setSubmitError(t("form.error", "An error occurred submitting your request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    { icon: <MapPin className="w-5 h-5 text-primary" />, title: t("info.methods.address.title", "Office Address"), details: t("info.methods.address.value", "Douala, Littoral Region, Cameroon") },
    { icon: <Phone className="w-5 h-5 text-primary" />, title: t("info.methods.phone.title", "Phone Numbers"), details: t("info.methods.phone.value", "+237 686 661 578") },
    { icon: <Mail className="w-5 h-5 text-primary" />, title: t("info.methods.email.title", "Email Addresses"), details: t("info.methods.email.value", "einortsolutions237@gmail.com") },
    { icon: <Globe className="w-5 h-5 text-primary" />, title: t("info.methods.website.title", "Website"), details: t("info.methods.website.value", "www.einortsolutions.com") },
    { icon: <Clock className="w-5 h-5 text-primary" />, title: t("info.methods.hours.title", "Business Hours"), details: t("info.methods.hours.value", "Mon-Fri: 9AM - 6PM WAT") },
  ];

  const whyChooseUs = [
    { icon: <Building2 className="w-8 h-8 text-primary" />, title: t("advantages.items.0.title", "Enterprise Expertise"), desc: t("advantages.items.0.description", "Proven track record delivering large-scale systems.") },
    { icon: <Cpu className="w-8 h-8 text-primary" />, title: t("advantages.items.1.title", "AI-Powered Solutions"), desc: t("advantages.items.1.description", "Next-gen intelligent software architecture.") },
    { icon: <Zap className="w-8 h-8 text-primary" />, title: t("advantages.items.2.title", "Modern Technologies"), desc: t("advantages.items.2.description", "Built with React, Next.js, and cutting-edge stacks.") },
    { icon: <ShieldCheck className="w-8 h-8 text-primary" />, title: t("advantages.items.3.title", "Scalable Systems"), desc: t("advantages.items.3.description", "Infrastructure designed to grow with your business.") },
    { icon: <Globe2 className="w-8 h-8 text-primary" />, title: t("advantages.items.4.title", "Global Standards"), desc: t("advantages.items.4.description", "World-class engineering and UI/UX design.") },
    { icon: <HeadphonesIcon className="w-8 h-8 text-primary" />, title: t("advantages.items.5.title", "Dedicated Support"), desc: t("advantages.items.5.description", "24/7 technical assistance and maintenance.") },
  ];

  const faqs = [
    { q: t("faq.items.0.q", "How long does a project take?"), a: t("faq.items.0.a", "Project timelines vary depending on complexity. A standard corporate website takes 2-4 weeks, while a custom ERP or SaaS platform can take 3-6 months. We provide precise timelines during the technical discovery phase.") },
    { q: t("faq.items.1.q", "Do you work internationally?"), a: t("faq.items.1.a", "Yes. While our core market is Africa, we deliver enterprise solutions for clients globally, ensuring timezone overlaps for critical meetings.") },
    { q: t("faq.items.2.q", "Can you customize EINORT ERP?"), a: t("faq.items.2.a", "Absolutely. EINORT ERP is built modularly. We tailor workflows, dashboards, and integrations specifically for your business operations.") },
    { q: t("faq.items.3.q", "How much does a website cost?"), a: t("faq.items.3.a", "Costs depend on scope, features, and integrations. We build premium, high-converting platforms rather than generic templates. Contact us for a precise quotation.") },
    { q: t("faq.items.4.q", "How do I request a quotation?"), a: t("faq.items.4.a", "Fill out the contact form above with details about your project, and our architecture team will respond within 24 hours to schedule a discovery call.") },
    { q: t("faq.items.5.q", "Can you redesign an existing system?"), a: t("faq.items.5.a", "Yes. We specialize in digital transformation, taking legacy systems and upgrading them to modern, scalable, and beautifully designed cloud applications.") },
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  });

  return (
    <div className="bg-background min-h-dvh pt-24 pb-0">
      <SEO 
        title="Contact Us | Einort Solutions"
        description="Get in touch with Einort Solutions. Let's discuss your enterprise software, ERP, website, or digital transformation needs."
        schema={faqSchema}
      />
      
      {/* 1. Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <Container>
          <div className="max-w-3xl mx-auto mb-10 relative z-10">
            <Breadcrumbs 
              items={[
                { label: "Home", href: "/" },
                { label: "Contact Us" }
              ]} 
            />
          </div>
          <FadeUp>
            <div className="max-w-3xl text-center mx-auto mb-16 relative z-10">
              <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6 leading-tight tracking-tight">
                Let's Build Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Extraordinary</span> Together
              </h1>
              <p className="text-lg md:text-xl text-text-muted font-light leading-relaxed mb-10">
                EINORT helps businesses grow through bespoke software, AI integrations, seamless automation, tailored ERPs, and complete digital transformation. Reach out to start your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-12 px-8 uppercase tracking-widest text-xs font-bold"
                >
                  Schedule Consultation
                </Button>
                <a href="https://wa.me/message/52SRSBT3VZXQB1" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2">
      Chat Via WhatsApp
    </a>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* 2 & 3. Contact Info and Form Grid */}
      <section className="py-12 relative z-10" id="contact-form">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <FadeUp delay={0.1}>
                <h3 className="text-2xl font-display text-white mb-6">Contact Information</h3>
                <div className="grid gap-4">
                  {contactMethods.map((method, idx) => (
                    <Card key={idx} className="bg-background/50 border-white/5 hover:border-white/10 transition-colors group">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                          {method.icon}
                        </div>
                        <div>
                          <p className="text-sm text-text-muted mb-1 font-medium">{method.title}</p>
                          <div className="text-white text-[15px]">
                            {method.title === "Phone Numbers" ? (
                              <a href={`tel:${method.details.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors" onClick={() => AnalyticsService.trackPhoneClick()}>
                                {method.details}
                              </a>
                            ) : method.title === "Email Addresses" ? (
                              <a href={`mailto:${method.details}`} className="hover:text-primary transition-colors" onClick={() => AnalyticsService.trackEmailClick()}>
                                {method.details}
                              </a>
                            ) : method.title === "Website" ? (
                              <a href={`https://${method.details}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                {method.details}
                              </a>
                            ) : (
                              method.details
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FadeUp>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <FadeUp delay={0.2}>
                <Card className="bg-background/80 border-white/5 shadow-2xl backdrop-blur-xl">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <CardTitle className="text-2xl font-display text-white">{t("form.title", "Send us a message")}</CardTitle>
                    <p className="text-text-muted text-sm mt-2">{t("form.subtitle", "Fill out the form below and our team will get back to you within 24 hours.")}</p>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    {isSuccess ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 size={40} className="text-primary" />
                        </div>
                        <h4 className="text-2xl font-display text-white mb-4">{t("form.success.title", "Request Received")}</h4>
                        <p className="text-text-muted mb-8 max-w-md mx-auto">
                          {t("form.success.description", "Thank you for reaching out to EINORT Solutions. Our architecture team is reviewing your details and will be in touch shortly.")}
                        </p>
                        <Button onClick={() => setIsSuccess(false)} variant="outline">
    {t("form.success.cta", "Send Another Message")}
  </Button>
  {successContact === "whatsapp" && (
    <a href="https://wa.me/message/52SRSBT3VZXQB1" target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8 py-2">
      {t("methods.whatsapp", "Chat via WhatsApp")}
    </a>
  )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="clientName" className="text-sm font-medium text-text-muted">{t("form.fields.name", "Full Name *")}</label>
                            <Input id="clientName" {...register("clientName")} placeholder={t("form.placeholders.name", "John Doe")} className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.clientName && <p className="text-red-400 text-xs mt-1">{errors.clientName.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium text-text-muted">{t("form.fields.company", "Company Name *")}</label>
                            <Input id="company" {...register("company")} placeholder={t("form.placeholders.company", "Acme Corp")} className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-text-muted">{t("form.fields.email", "Email Address *")}</label>
                            <Input id="email" {...register("email")} type="email" placeholder={t("form.placeholders.email", "john@company.com")} className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-text-muted">{t("form.fields.phone", "Phone Number *")}</label>
                            <Input id="phone" {...register("phone")} type="tel" placeholder={t("form.placeholders.phone", "+237 600 000 000")} className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="country" className="text-sm font-medium text-text-muted">{t("form.fields.country", "Country *")}</label>
                            <Input id="country" {...register("country")} placeholder="Cameroon" className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="industry" className="text-sm font-medium text-text-muted">{t("form.fields.industry", "Business Industry *")}</label>
                            <Input id="industry" {...register("industry")} placeholder="Finance, Logistics, Retail..." className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium text-text-muted">{t("form.fields.subject", "Subject *")}</label>
                            <Input id="subject" {...register("subject")} placeholder="Project Inquiry" className="bg-surface border-white/5 focus:border-primary/50" />
                            {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="projectType" className="text-sm font-medium text-text-muted">{t("form.fields.service", "Service Interested In *")}</label>
                            <div className="relative">
                              <select 
                                id="projectType"
                                {...register("projectType")} 
                                className="w-full h-12 bg-surface border border-white/5 rounded-lg px-4 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none appearance-none transition-all"
                              >
                                <option value="" disabled>Select a service</option>
                                {servicesList.map(s => <option key={s} value={s} className="bg-surface text-white">{s}</option>)}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                              </div>
                            </div>
                            {errors.projectType && <p className="text-red-400 text-xs mt-1">{errors.projectType.message}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="requirements" className="text-sm font-medium text-text-muted">{t("form.fields.message", "Message / Requirements *")}</label>
                          <textarea 
                            id="requirements"
                            {...register("requirements")} 
                            placeholder={t("form.placeholders.message", "Tell us about your goals, current challenges, and timeline...")} 
                            className="w-full min-h-[120px] bg-surface border border-white/5 rounded-lg p-4 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-y"
                          />
                          {errors.requirements && <p className="text-red-400 text-xs mt-1">{errors.requirements.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-text-muted mb-2 block">{t("form.fields.contact_method", "Preferred Contact Method *")}</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" value="email" {...register("preferredContact")} className="text-primary bg-surface border-white/10 focus:ring-primary/50" />
                              <span className="text-sm text-text-main group-hover:text-white transition-colors">Email</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" value="phone" {...register("preferredContact")} className="text-primary bg-surface border-white/10 focus:ring-primary/50" />
                              <span className="text-sm text-text-main group-hover:text-white transition-colors">Phone Call</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <input type="radio" value="whatsapp" {...register("preferredContact")} className="text-primary bg-surface border-white/10 focus:ring-primary/50" />
                              <span className="text-sm text-text-main group-hover:text-white transition-colors">WhatsApp</span>
                            </label>
                          </div>
                          {errors.preferredContact && <p className="text-red-400 text-xs mt-1">{errors.preferredContact.message}</p>}
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" {...register("consent")} className="mt-1 text-primary bg-surface border-white/10 rounded focus:ring-primary/50" />
                            <span className="text-sm text-text-muted leading-relaxed">
                              {t("form.fields.consent", "I consent to EINORT Solutions processing my personal data in order to handle this inquiry, in accordance with the Privacy Policy.")}
                            </span>
                          </label>
                          {errors.consent && <p className="text-red-400 text-xs">{errors.consent.message}</p>}
                        </div>
                        
                        {submitError && (
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {submitError}
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={isSubmitting} 
                          className="w-full h-14 text-sm uppercase tracking-widest font-bold"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> {t("form.submitting", "Processing")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">{t("form.submit", "Submit Request")} <ArrowRight className="w-4 h-4" /></span>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </FadeUp>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Interactive Map */}
      <section className="py-20">
        <Container>
          <FadeUp>
            <div className="rounded-2xl overflow-hidden border border-white/5 h-[400px] md:h-[500px] relative bg-surface">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127415.75338101416!2d9.664426543359374!3d4.047806199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1061128be2e1fe6d%3A0x92daa1444781c48b!2sDouala%2C%20Cameroon!5e0!3m2!1sen!2sus!4v1716335123456!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(100%) grayscale(50%) opacity(0.8)" }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="EINORT Location"
                className="absolute inset-0"
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(10,14,23,0.8)]"></div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* 5. Why Choose EINORT */}
      <section className="py-24 bg-surface/50 border-y border-white/5">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">The Einort Advantage</h2>
            <h3 className="text-3xl md:text-5xl font-display font-medium text-white">Why Choose EINORT</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((feature, idx) => (
              <FadeUp key={idx} delay={idx * 0.1}>
                <Card className="bg-background border-white/5 hover:border-white/10 transition-colors h-full">
                  <CardContent className="p-8">
                    <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/20">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-display text-white mb-3">{feature.title}</h4>
                    <p className="text-text-muted font-light leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Business Consultation CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <Container>
          <FadeUp>
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h3 className="text-4xl md:text-5xl font-display font-medium text-white mb-6">Need help transforming your business?</h3>
              <p className="text-xl text-text-muted font-light mb-10 max-w-2xl mx-auto">
                Schedule a one-on-one session with our enterprise architects to discuss your bottlenecks, goals, and technical feasibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-14 px-10 uppercase tracking-widest text-xs font-bold"
                >
                  Book Consultation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-14 px-10 uppercase tracking-widest text-xs font-bold bg-background/50"
                >
                  Talk to an Expert
                </Button>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-24 bg-surface border-t border-white/5">
        <Container>
          <div className="max-w-3xl mx-auto">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Clear Answers</h2>
                <h3 className="text-3xl md:text-5xl font-display font-medium text-white">Frequently Asked Questions</h3>
              </div>
            </FadeUp>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <FadeUp key={idx} delay={idx * 0.1}>
                  <details className="group bg-background border border-white/5 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer p-6 font-medium text-white">
                      <span className="text-lg font-display tracking-wide">{faq.q}</span>
                      <span className="transition group-open:rotate-180">
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      </span>
                    </summary>
                    <div className="p-6 pt-0 text-text-muted font-light leading-relaxed border-t border-white/5">
                      <p className="mt-4">{faq.a}</p>
                    </div>
                  </details>
                </FadeUp>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Social Media Connect Section */}
      <div className="bg-surface pb-12">
        <Container>
          <SocialMediaSection />
        </Container>
      </div>

      {/* 8. Final CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full blur-[120px] bg-primary/20 rounded-full pointer-events-none"></div>
        <Container>
          <FadeUp>
            <div className="text-center relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-display font-medium text-white mb-8 tracking-tight">
                Ready to transform your business?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-14 px-12 uppercase tracking-widest text-xs font-bold"
                >
                  Contact Us
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-14 px-12 uppercase tracking-widest text-xs font-bold bg-background/50 backdrop-blur-sm"
                >
                  Request Demo
                </Button>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
    </div>
  );
}
