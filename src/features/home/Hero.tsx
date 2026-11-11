import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Button } from "../../components/ui/Button";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

export function Hero() {
  const { t } = useTranslation('hero');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <header
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col justify-center min-h-dvh perspective-[1000px]"
    >
      {/* Abstract Background Elements with Parallax */}
      <motion.div
        style={{ y: yBackground }}
        className="absolute top-0 inset-x-0 h-full overflow-hidden -z-10 pointer-events-none will-change-transform flex justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 to-transparent animate-pulse rounded-full"
          style={{ animationDuration: "8s" }}
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut", delay: 0.2 }}
          className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 to-transparent animate-pulse rounded-full"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        ></motion.div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.08] pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
      </motion.div>

      <Container className="text-center relative z-10 flex flex-col items-center">
        <motion.div
          style={{ opacity: opacityText, scale: scaleText }}
          className="flex flex-col items-center w-full"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-xl shadow-2xl hover:border-white/20 transition-all mx-auto cursor-default opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(10,102,194,0.8)] animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-300">
              {t("badge")}
            </span>
          </div>

          <h1 className="text-[2.2rem] min-[375px]:text-[2.5rem] min-[425px]:text-[3rem] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8.5rem] font-display font-medium tracking-tighter leading-[0.9] mb-8 text-white max-w-6xl mx-auto drop-shadow-2xl opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
            {t("title_part_1")} <br className="hidden md:block" />
            {t("title_part_2")}{" "}
            <span className="relative sm:whitespace-nowrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-primary to-blue-600">
                {t("title_part_3")}
              </span>
              <div className="absolute -inset-x-8 -inset-y-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 to-transparent -z-10 rounded-full"></div>
            </span>
          </h1>

          <h2 className="sr-only">
            {t("sr_description")}
          </h2>
          <p className="text-lg md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
            <Button
              size="lg"
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto uppercase tracking-[0.2em] text-[11px] px-12 h-14 font-bold shadow-2xl"
            >
              {t("button_primary")}
            </Button>
            <a href="https://wa.me/message/52SRSBT3VZXQB1" target="_blank" rel="noopener noreferrer" className="border-white/10 hover:bg-white/5 group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8">
      {t("button_whatsapp")}
    </a>
          </div>
        </motion.div>

        <FadeUp
          delay={0.8}
          className="mt-28 w-full max-w-5xl opacity-40 hover:opacity-100 transition-opacity duration-700 hidden md:block"
        >
          <div className="grid grid-cols-6 gap-4 text-center items-center text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            <span>Next.js</span>
            <span>React</span>
            <span>TypeScript</span>
            <span>TailwindCSS</span>
            <span>Firebase</span>
            <span>PostgreSQL</span>
          </div>
        </FadeUp>
      </Container>
    </header>
  );
}
