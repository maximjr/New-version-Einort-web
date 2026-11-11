import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Container } from "../../components/layout/Container";
import { FadeUp } from "../../components/animations/FadeUp";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Code2,
  Database,
  LayoutTemplate,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { ProjectOrchestrator } from "../services/projectOrchestrator";
import { rateLimiter } from "../../lib/rateLimiter";
import { sanitizeInputText } from "../../lib/sanitizer";

import { useTranslation } from "react-i18next";

export function ContactForm() {
  const { t } = useTranslation(['forms', 'validation', 'errors']);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();

  const formSchema = z.object({
    projectType: z.string().min(1, t("validation:project_type_required")),
    budget: z.string().min(1, t("validation:budget_required")),
    timeline: z.string().min(1, t("validation:timeline_required")),
    requirements: z
      .string()
      .min(10, t("validation:requirements_min")),
    clientName: z.string().min(2, t("validation:name_min")),
    email: z.string().email(t("validation:email_invalid")),
    company: z.string().min(2, t("validation:company_required")),
    industry: z.string().min(2, t("validation:industry_required")),
    urgency: z.string().min(1, t("validation:urgency_required")),
    selectedFeatures: z.array(z.string()),
  });

  type ContactFormData = z.infer<typeof formSchema>;

  const projectTypes = [
    {
      id: "enterprise",
      label: t("wizard.project_types.enterprise"),
      icon: <Code2 size={24} />,
    },
    { id: "saas", label: t("wizard.project_types.saas"), icon: <Database size={24} /> },
    { id: "uiux", label: t("wizard.project_types.uiux"), icon: <LayoutTemplate size={24} /> },
    { id: "other", label: t("wizard.project_types.other"), icon: <Smartphone size={24} /> },
  ];

  const budgetRanges = [
    { id: "1k-5k", label: t("wizard.budgets.b1") },
    { id: "5k-10k", label: t("wizard.budgets.b2") },
    { id: "10k-15k", label: t("wizard.budgets.b3") },
    { id: "20k+", label: t("wizard.budgets.b4") },
  ];

  const timelines = [
    { id: "immediate", label: t("wizard.urgency.high") },
    { id: "3-6m", label: t("wizard.urgency.medium") },
    { id: "6m+", label: t("wizard.urgency.low") },
    { id: "flexible", label: t("wizard.urgency.select") },
  ];

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: "",
      budget: "",
      timeline: "",
      requirements: "",
      clientName: "",
      email: "",
      company: "",
      industry: "",
      urgency: "",
      selectedFeatures: [],
    },
  });

  const watchProjectType = watch("projectType");
  const watchBudget = watch("budget");
  const watchTimeline = watch("timeline");

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["projectType", "budget"]);
    } else if (step === 2) {
      isValid = await trigger(["timeline", "urgency", "requirements"]);
    }
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    const limit = rateLimiter.check('contact', data.email.toLowerCase());
    if (!limit.allowed) {
      setSubmitError(`Too many inquiries sent. Please wait ${Math.ceil(limit.resetTimeMs / 60000)} minute(s).`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await ProjectOrchestrator.submitProject({
        userId: user?.uid || "anonymous",
        email: data.email.trim().toLowerCase(),
        clientName: sanitizeInputText(data.clientName, 128),
        company: sanitizeInputText(data.company, 128),
        industry: data.industry,
        projectType: data.projectType,
        selectedFeatures: data.selectedFeatures,
        requirements: sanitizeInputText(data.requirements || '', 2000),
        budget: data.budget,
        timeline: data.timeline,
        urgency: data.urgency,
        status: "pending",
      });

      if (result.success) {
        rateLimiter.reset('contact', data.email.toLowerCase());
        setIsSuccess(true);
        reset();
        setStep(1);
      } else {
        setSubmitError(
          result.message || t("errors:generic"),
        );
      }
    } catch (error) {
      setSubmitError(t("errors:generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-surface relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[800px] bg-primary/5 blur-[200px] pointer-events-none rounded-full translate-x-1/2"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <FadeUp className="lg:col-span-5 pt-8">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
              {t("project_discovery.badge")}
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tighter text-white mb-6 leading-[1.1]">
              {t("project_discovery.title_part_1")} <br /> {t("project_discovery.title_part_2")}
            </h2>
            <p className="text-lg text-text-muted mb-10 leading-relaxed font-light">
              {t("project_discovery.description")}
            </p>

            <div className="space-y-6">
              {[
                { stepNum: 1, title: t("project_discovery.steps.step1") },
                { stepNum: 2, title: t("project_discovery.steps.step2") },
                { stepNum: 3, title: t("project_discovery.steps.step3") },
              ].map((s) => (
                <div
                  key={s.stepNum}
                  className={cn(
                    "flex items-center gap-4 transition-all duration-500",
                    step === s.stepNum ? "opacity-100" : "opacity-30",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full font-mono text-sm flex items-center justify-center border transition-all duration-500",
                      step === s.stepNum
                        ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(10,102,194,0.4)]"
                        : step > s.stepNum
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-transparent text-slate-500 border-white/10",
                    )}
                  >
                    {step > s.stepNum ? <CheckCircle2 size={16} /> : s.stepNum}
                  </div>
                  <span
                    className={cn(
                      "uppercase tracking-widest text-xs font-bold",
                      step === s.stepNum ? "text-white" : "text-slate-500",
                    )}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2} className="lg:col-span-7 relative min-h-[500px]">
            <div className="relative w-full h-full">
              <Card className="bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl relative w-full overflow-hidden min-h-[550px]">
                <div className="h-1 bg-white/5 w-full absolute top-0 left-0">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "33%" }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                <CardContent className="p-8 md:p-12 relative h-full flex flex-col">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                      >
                        <h4 className="text-2xl font-display text-white mb-6">
                          {t("wizard.step1_title")}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <Controller
                            name="projectType"
                            control={control}
                            render={({ field }) => (
                              <>
                                {projectTypes.map((type) => (
                                  <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => field.onChange(type.id)}
                                    className={cn(
                                      "p-4 rounded-xl border text-left transition-all duration-300 flex flex-col gap-3 group",
                                      watchProjectType === type.id
                                        ? "bg-primary/10 border-primary shadow-[0_0_20px_-5px_rgba(10,102,194,0.3)]"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/5",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "text-slate-400 group-hover:text-primary transition-colors",
                                        watchProjectType === type.id &&
                                          "text-primary",
                                      )}
                                    >
                                      {type.icon}
                                    </div>
                                    <span
                                      className={cn(
                                        "font-medium text-sm",
                                        watchProjectType === type.id
                                          ? "text-white"
                                          : "text-slate-400",
                                      )}
                                    >
                                      {type.label}
                                    </span>
                                  </button>
                                ))}
                              </>
                            )}
                          />
                        </div>
                        {errors.projectType && (
                          <p className="text-red-400 text-xs mt-1 mb-6 relative -top-4">
                            {errors.projectType.message}
                          </p>
                        )}

                        <h4 className="text-xl font-display text-white mb-4">
                          {t("wizard.budget_title")}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <Controller
                            name="budget"
                            control={control}
                            render={({ field }) => (
                              <>
                                {budgetRanges.map((range) => (
                                  <button
                                    key={range.id}
                                    type="button"
                                    onClick={() => field.onChange(range.id)}
                                    className={cn(
                                      "py-3 px-4 rounded-lg border text-center transition-all duration-300",
                                      watchBudget === range.id
                                        ? "bg-primary border-primary text-white"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white",
                                    )}
                                  >
                                    <span className="font-mono text-xs">
                                      {range.label}
                                    </span>
                                  </button>
                                ))}
                              </>
                            )}
                          />
                        </div>
                        {errors.budget && (
                          <p className="text-red-400 text-xs mt-1 relative">
                            {errors.budget.message}
                          </p>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="gap-2"
                          >
                            {t("buttons.continue")} <ArrowRight size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                      >
                        <h4 className="text-2xl font-display text-white mb-6">
                          {t("wizard.step2_title")}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                          <Controller
                            name="timeline"
                            control={control}
                            render={({ field }) => (
                              <>
                                {timelines.map((time) => (
                                  <button
                                    key={time.id}
                                    type="button"
                                    onClick={() => field.onChange(time.id)}
                                    className={cn(
                                      "py-3 px-4 rounded-lg border text-center transition-all duration-300",
                                      watchTimeline === time.id
                                        ? "bg-primary/20 border-primary text-white"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20 hover:text-white",
                                    )}
                                  >
                                    <span className="font-mono text-xs">
                                      {time.label}
                                    </span>
                                  </button>
                                ))}
                              </>
                            )}
                          />
                        </div>
                        {errors.timeline && (
                          <p className="text-red-400 text-xs mt-1 mb-6 relative -top-4">
                            {errors.timeline.message}
                          </p>
                        )}

                        <div className="space-y-4 mb-4">
                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="urgency"
                            >
                              {t("labels.urgency")}
                            </label>
                            <select
                              id="urgency"
                              {...register("urgency")}
                              className={`flex w-full rounded-md border border-white/5 bg-surface/50 px-4 py-3 text-[15px] text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 ${errors.urgency ? "border-red-500/50" : ""}`}
                            >
                              <option value="">{t("wizard.urgency.select")}</option>
                              <option value="high">
                                {t("wizard.urgency.high")}
                              </option>
                              <option value="medium">
                                {t("wizard.urgency.medium")}
                              </option>
                              <option value="low">
                                {t("wizard.urgency.low")}
                              </option>
                            </select>
                            {errors.urgency && (
                              <p className="text-red-400 text-xs mt-1">
                                {errors.urgency.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="requirements"
                            >
                              {t("labels.requirements")}
                            </label>
                            <textarea
                              id="requirements"
                              rows={5}
                              placeholder={t("placeholders.requirements")}
                              {...register("requirements")}
                              className={`flex w-full rounded-md border border-white/5 bg-surface/50 px-4 py-3 text-[15px] text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 resize-none ${errors.requirements ? "border-red-500/50" : ""}`}
                            />
                            {errors.requirements && (
                              <p className="text-red-400 text-xs mt-1">
                                {errors.requirements.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-between">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setStep(1)}
                            className="gap-2"
                          >
                            <ArrowLeft size={16} /> {t("buttons.back")}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="gap-2"
                          >
                            {t("buttons.continue")} <ArrowRight size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                      >
                        <h4 className="text-2xl font-display text-white mb-6">
                          {t("wizard.step3_title")}
                        </h4>
                        <div className="space-y-5 mb-8">
                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="clientName"
                            >
                              {t("labels.full_name")}
                            </label>
                            <Input
                              id="clientName"
                              placeholder={t("placeholders.full_name")}
                              {...register("clientName")}
                              className={
                                errors.clientName ? "border-red-500/50" : ""
                              }
                            />
                            {errors.clientName && (
                              <p className="text-red-400 text-xs">
                                {errors.clientName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="company"
                            >
                              {t("labels.company")}
                            </label>
                            <Input
                              id="company"
                              placeholder={t("placeholders.company")}
                              {...register("company")}
                              className={
                                errors.company ? "border-red-500/50" : ""
                              }
                            />
                            {errors.company && (
                              <p className="text-red-400 text-xs">
                                {errors.company.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="industry"
                            >
                              {t("labels.industry")}
                            </label>
                            <Input
                              id="industry"
                              placeholder={t("placeholders.industry")}
                              {...register("industry")}
                              className={
                                errors.industry ? "border-red-500/50" : ""
                              }
                            />
                            {errors.industry && (
                              <p className="text-red-400 text-xs">
                                {errors.industry.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label
                              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400"
                              htmlFor="email"
                            >
                              {t("labels.work_email")}
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder={t("placeholders.work_email")}
                              {...register("email")}
                              className={
                                errors.email ? "border-red-500/50" : ""
                              }
                            />
                            {errors.email && (
                              <p className="text-red-400 text-xs">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {submitError && (
                          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                            <XCircle size={16} /> {submitError}
                          </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setStep(2)}
                            className="gap-2 px-0"
                          >
                            <ArrowLeft size={16} /> {t("buttons.back")}
                          </Button>
                          {!user ? (
                            <Button
                              type="button"
                              onClick={() =>
                                window.dispatchEvent(
                                  new CustomEvent("open-auth", {
                                    detail: { mode: "register" },
                                  }),
                                )
                              }
                              className="tracking-[0.1em] font-bold gap-2"
                            >
                              {t("buttons.login_to_submit")}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={handleSubmit(onSubmit)}
                              disabled={isSubmitting}
                              className="tracking-[0.1em] font-bold gap-2"
                            >
                              {isSubmitting ? (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                              ) : (
                                t("buttons.initiate")
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </FadeUp>
        </div>
      </Container>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsSuccess(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg"
            >
              <Card className="bg-surface/95 border-white/10 shadow-2xl flex flex-col justify-center items-center text-center p-12">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-3xl font-display font-medium text-white mb-3">
                  {t("wizard.success.title")}
                </h4>
                <p className="text-text-muted text-lg font-light mb-8 max-w-sm">
                  {t("wizard.success.description")}
                </p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                  {t("buttons.close_continue")}
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
