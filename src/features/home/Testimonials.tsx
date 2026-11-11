import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Card, CardContent } from "../../components/ui/Card";

import { useTranslation } from "react-i18next";

const testimonialKeys = ["t1", "t2", "t3"];

export function Testimonials() {
  const { t } = useTranslation('home');

  return (
    <section
      id="testimonials"
      className="py-32 bg-background border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[200px] pointer-events-none rounded-t-full -translate-x-1/2"></div>
      <Container className="relative z-10">
        <FadeUp className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
                {t("testimonials.badge")}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white max-w-2xl leading-[1.1]">
                {t("testimonials.title_part_1")} <br /> {t("testimonials.title_part_2")}
              </h2>
            </div>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialKeys.map((key, i) => (
            <FadeUp key={i} delay={0.15 * i} className="h-full">
              <Card className="h-full bg-surface/50 border-white/5 p-8 flex flex-col justify-between hover:border-white/10 hover:bg-surface/80 transition-all duration-500 group">
                <CardContent className="p-0">
                  <div className="text-primary mb-8 transform group-hover:scale-110 transition-transform origin-left duration-500">
                    <svg
                      width="36"
                      height="28"
                      viewBox="0 0 32 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.432 23.496C9.648 23.496 7.332 22.56 5.484 20.688C3.636 18.816 2.712 16.5 2.712 13.74C2.712 10.668 3.552 7.824 5.232 5.208C6.912 2.592 9.072 0.732 11.712 0L13.728 2.592C11.664 3.696 10.02 5.208 8.796 7.128C7.572 9.048 6.96 11.232 6.96 13.68H12.432V23.496ZM29.28 23.496C26.496 23.496 24.18 22.56 22.332 20.688C20.484 18.816 19.56 16.5 19.56 13.74C19.56 10.668 20.4 7.824 22.08 5.208C23.76 2.592 25.92 0.732 28.56 0L30.576 2.592C28.512 3.696 26.868 5.208 25.644 7.128C24.42 9.048 23.808 11.232 23.808 13.68H29.28V23.496Z"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                  <p className="text-text-main text-[17px] font-light leading-relaxed mb-10">
                    "{t(`testimonials.items.${key}.quote`)}"
                  </p>
                </CardContent>
                <div className="pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                  <p className="text-white font-medium text-sm tracking-wide mb-1">
                    {t(`testimonials.items.${key}.author`)}
                  </p>
                  <p className="text-text-muted text-[11px] font-mono tracking-widest uppercase">
                    {t(`testimonials.items.${key}.role`)}
                  </p>
                </div>
              </Card>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
