import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Button } from "../../components/ui/Button";
import { ArrowRight } from "lucide-react";

import { useTranslation } from "react-i18next";

const reasons = [
  {
    number: "01",
    key: "r1",
  },
  {
    number: "02",
    key: "r2",
  },
  {
    number: "03",
    key: "r3",
  },
];

export function WhyChooseUs() {
  const { t } = useTranslation('about');

  return (
    <section
      id="why-us"
      className="py-32 bg-surface border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <Container>
        <FadeUp>
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
              {t("why_choose_us.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-white mb-8 leading-[1.1]">
              {t("why_choose_us.title_part_1")} <br className="hidden md:block" /> {t("why_choose_us.title_part_2")}
            </h2>
            <p className="text-xl text-text-muted font-light leading-relaxed">
              {t("why_choose_us.description")}
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 mb-20">
          {reasons.map((reason, index) => (
            <FadeUp key={index} delay={index * 0.15} className="relative group">
              <div className="absolute -top-10 -left-6 text-8xl font-display font-bold text-white/[0.02] group-hover:text-primary/10 transition-colors duration-700 z-0 select-none pointer-events-none">
                {reason.number}
              </div>
              <div className="relative z-10 pt-6 border-t border-white/10 group-hover:border-primary/50 transition-colors duration-500">
                <div className="absolute top-0 left-0 w-0 h-px bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-1000 ease-out"></div>
                <h3 className="text-2xl font-display font-medium text-white mb-4 tracking-wide">
                  {t(`why_choose_us.reasons.${reason.key}.title`)}
                </h3>
                <p className="text-text-muted leading-relaxed font-light text-[15px]">
                  {t(`why_choose_us.reasons.${reason.key}.description`)}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="uppercase tracking-[0.2em] text-[11px] px-12 h-14 font-bold shadow-2xl gap-3"
            >
              {t("why_choose_us.cta")} <ArrowRight size={16} />
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
