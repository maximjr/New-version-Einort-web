import { useState } from "react";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { SEO } from "../../components/seo/SEO";
import { useTranslation } from "react-i18next";

export function FAQ() {
  const { t } = useTranslation("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t("questions.q1.question"),
      answer: t("questions.q1.answer"),
    },
    {
      question: t("questions.q2.question"),
      answer: t("questions.q2.answer"),
    },
    {
      question: t("questions.q3.question"),
      answer: t("questions.q3.answer"),
    },
    {
      question: t("questions.q4.question"),
      answer: t("questions.q4.answer"),
    },
    {
      question: t("questions.q5.question"),
      answer: t("questions.q5.answer"),
    },
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  });

  return (
    <section className="py-24 bg-background z-10 relative border-t border-white/5">
      <SEO schema={faqSchema} />
      <Container>
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="flex flex-col gap-4 text-center mb-16">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {t("title")}
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white leading-[1.1]">
                {t("subtitle_1")} <br /> {t("subtitle_2")}
              </h2>
            </div>
          </FadeUp>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <FadeUp key={index} delay={0.1 * index}>
                  <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                    <button
                      className="w-full text-left px-6 py-6 flex items-center justify-between focus:outline-none"
                      onClick={() => toggleFAQ(index)}
                    >
                      <h3 className="text-lg font-medium text-white pr-8">
                        {faq.question}
                      </h3>
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300",
                          isOpen ? "rotate-180" : "",
                        )}
                      >
                        <ChevronDown size={16} className="text-white/60" />
                      </div>
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-6 pt-2 text-text-muted font-light leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
