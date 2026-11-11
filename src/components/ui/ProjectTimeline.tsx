import { motion } from "motion/react";
import { CheckCircle2, Clock, Map, Layout, Code2, ShieldAlert, FileSearch, RefreshCw, Server, Send, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ProjectTimelineProps {
  status: string;
}

export function ProjectTimeline({ status }: ProjectTimelineProps) {
  const { t } = useTranslation("admin");
  const currentStatus = (status || "pending").toLowerCase();
  const isCancelled = currentStatus === "cancelled";

  // Full 10-stage execution pipeline plus custom styling for decommissioning
  const PIPELINE_STAGES = [
    { key: "pending", label: t("timeline_stages.pending.label"), icon: Clock, description: t("timeline_stages.pending.description") },
    { key: "discovery", label: t("timeline_stages.discovery.label"), icon: Map, description: t("timeline_stages.discovery.description") },
    { key: "planning", label: t("timeline_stages.planning.label"), icon: ShieldAlert, description: t("timeline_stages.planning.description") },
    { key: "ui_ux", label: t("timeline_stages.ui_ux.label"), icon: Layout, description: t("timeline_stages.ui_ux.description") },
    { key: "development", label: t("timeline_stages.development.label"), icon: Code2, description: t("timeline_stages.development.description") },
    { key: "testing", label: t("timeline_stages.testing.label"), icon: FileSearch, description: t("timeline_stages.testing.description") },
    { key: "review", label: t("timeline_stages.review.label"), icon: ShieldAlert, description: t("timeline_stages.review.description") },
    { key: "revision", label: t("timeline_stages.revision.label"), icon: RefreshCw, description: t("timeline_stages.revision.description") },
    { key: "deployment", label: t("timeline_stages.deployment.label"), icon: Server, description: t("timeline_stages.deployment.description") },
    { key: "completed", label: t("timeline_stages.completed.label"), icon: Send, description: t("timeline_stages.completed.description") },
  ];

  // Gracefully resolve legacy or sub-states
  let mappedStatus = currentStatus;
  if (currentStatus === "new") mappedStatus = "pending";
  if (currentStatus === "analysis") mappedStatus = "planning";
  if (currentStatus === "design") mappedStatus = "ui_ux";
  if (currentStatus === "in-progress" || currentStatus === "active" || currentStatus === "building") mappedStatus = "development";

  const targetIndex = PIPELINE_STAGES.findIndex(s => s.key === mappedStatus);
  const currentIndex = targetIndex === -1 ? 0 : targetIndex;

  return (
    <div className="w-full py-8 px-4 bg-white/[0.01] border border-white/5 rounded-3xl relative overflow-hidden">
      {isCancelled ? (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
          <Ban className="text-red-400 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-red-200">{t("notices.project_decommissioned")}</h4>
            <p className="text-xs text-red-400">{t("notices.engagement_archived")}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">{t("notices.active_operational_milestone")}</span>
            <h4 className="text-[15px] font-medium text-white capitalize mt-1 flex items-center gap-2">
              {PIPELINE_STAGES[currentIndex]?.label || t("placeholders.na")}
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-mono italic">
            {PIPELINE_STAGES[currentIndex]?.description || t("placeholders.na")}
          </p>
        </div>
      )}

      {/* Pipeline Navigation Nodes Ribbon */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 mt-4 select-none">
        {/* Connecting Line (Only Desktop) */}
        <div className="absolute left-[20px] right-[20px] top-[24px] h-[2px] bg-white/[0.05] -translate-y-1/2 hidden md:block" />

        {/* Active Connecting Line Progress Ribbon */}
        {!isCancelled && (
          <motion.div
            className="absolute left-[20px] top-[24px] h-[2px] bg-primary -translate-y-1/2 hidden md:block shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (PIPELINE_STAGES.length - 1)) * 96}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}

        {PIPELINE_STAGES.map((step, index) => {
          const isCompleted = !isCancelled && index < currentIndex;
          const isActive = !isCancelled && index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 relative group flex-1">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500 bg-[#0d1224] ${
                  isCancelled
                    ? "border-red-500/20 text-red-500/50"
                    : isCompleted
                    ? "border-primary text-primary bg-[#0d1224] shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    : isActive
                    ? "border-primary text-white bg-primary scale-110 shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-4 ring-primary/10"
                    : "border-white/10 text-slate-500 hover:border-white/30"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
              </motion.div>

              <div className="flex flex-col md:items-center text-left md:text-center mt-1">
                <span
                  className={`text-[9px] uppercase font-bold tracking-widest transition-colors ${
                    isCancelled
                      ? "text-red-500/40"
                      : isActive
                      ? "text-primary font-extrabold"
                      : isCompleted
                      ? "text-slate-300"
                      : "text-slate-600 group-hover:text-slate-400"
                  }`}
                >
                  {step.label.split(". ")[1]}
                </span>
                <span className="text-[8px] text-slate-500 hidden lg:block font-mono mt-0.5 max-w-[80px] leading-tight">
                  {step.description.substring(0, 24)}...
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
