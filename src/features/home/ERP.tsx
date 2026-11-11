import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { CheckCircle2 } from "lucide-react";

import { useTranslation } from "react-i18next";

const erpFeatures = ["f1", "f2", "f3", "f4", "f5", "f6"];

export function ERP() {
  const { t } = useTranslation('services');

  return (
    <section
      id="architecture"
      className="py-32 relative overflow-hidden bg-background border-t border-white/5"
    >
      <div className="absolute top-1/2 left-0 w-1/2 h-full bg-primary/5 blur-[200px] -translate-y-1/2 pointer-events-none rounded-full"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <div className="relative group perspective-[2000px]">
              {/* Abstract Representation of ERP/Dashboard */}
              <div className="aspect-square max-w-lg mx-auto lg:mx-0 relative z-10 transition-transform duration-700 ease-out group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg]">
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-8 flex flex-col overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    </div>
                    <div className="h-4 w-24 bg-white/5 rounded-md"></div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background/50 rounded-xl border border-white/5 p-5 flex flex-col justify-between group-hover:border-primary/20 transition-colors">
                      <div className="h-3 w-16 bg-white/10 rounded mb-4"></div>
                      <div className="text-3xl font-mono text-white tracking-tighter">
                        42.8k
                      </div>
                    </div>
                    <div className="bg-background/50 rounded-xl border border-white/5 p-5 flex flex-col justify-between group-hover:border-primary/20 transition-colors">
                      <div className="h-3 w-16 bg-white/10 rounded mb-4"></div>
                      <div className="text-3xl font-mono text-white tracking-tighter">
                        98.2%
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-background/50 rounded-xl border border-white/5 p-4 relative overflow-hidden flex items-end">
                    {/* Fake Chart Lines */}
                    <svg
                      className="absolute bottom-0 left-0 w-full h-full text-primary opacity-40 group-hover:opacity-70 transition-opacity duration-1000"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M0 100 L 10 70 L 30 80 L 50 40 L 70 60 L 90 20 L 100 100 Z"
                        fill="url(#gradient)"
                        opacity="0.3"
                      />
                      <path
                        d="M0 100 L 10 70 L 30 80 L 50 40 L 70 60 L 90 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="currentColor" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -bottom-10 -right-10 w-56 bg-surface/90 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl hidden md:block transition-transform duration-700 group-hover:translate-y-[-10px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="h-3 w-24 bg-white/10 rounded"></div>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {t("erp.status")}
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>

          <div className="space-y-10 pl-0 lg:pl-10">
            <FadeUp delay={0.1}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
                {t("erp.badge")}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white mb-6 leading-[1.1]">
                {t("erp.title_part_1")} <br /> {t("erp.title_part_2")}
              </h2>
              <p className="text-xl text-text-muted leading-relaxed font-light">
                {t("erp.description")}
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                {erpFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5 opacity-80" />
                    <span className="text-sm font-medium text-slate-300 leading-tight">
                      {t(`erp.features.${feature}`)}
                    </span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </Container>
    </section>
  );
}
