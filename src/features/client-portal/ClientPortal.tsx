import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  Box,
  ArrowRight,
  ShieldCheck,
  Mail,
  Calendar,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/Card";
import { FadeUp } from "../../components/animations/FadeUp";
import { Button } from "../../components/ui/Button";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import { useAuth } from "../../hooks/useAuth";
import { projectService } from "../../services/admin/projectService";
import { ClientMessenger } from "./ClientMessenger";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SEO } from "../../components/seo/SEO";

import { useTranslation } from "react-i18next";

export function ClientPortal() {
  const { t, i18n } = useTranslation("portal");
  const { userData, user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "messaging">("overview");

  const getDetailedStatusPill = (status: string) => {
    const currentStatus = (status || "pending").toLowerCase();
    
    if (currentStatus === "cancelled") {
      return {
        label: t("project_status.cancelled"),
        bgClass: "bg-red-500/10 text-red-400 border-red-500/20",
        dotClass: "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      };
    }
    
    const pendingStages = ["pending", "new", "discovery"];
    const completedStages = ["completed", "launched", "deployment"];
    
    if (pendingStages.includes(currentStatus)) {
      return {
        label: t("project_status.pending_review"),
        bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse",
      };
    }
    
    if (completedStages.includes(currentStatus)) {
      return {
        label: t("project_status.completed"),
        bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      };
    }
    
    return {
      label: t("project_status.in_progress"),
      bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse",
    };
  };

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const activeDb = db;
    let projectsByUid: any[] = [];
    let projectsByEmail: any[] = [];
    let hasError = false;

    const handleMerge = (byUid: any[], byEmail: any[]) => {
      if (hasError) return;

      const map = new Map();
      byUid.forEach((p) => map.set(p.id, p));
      byEmail.forEach((p) => map.set(p.id, p));

      const merged = Array.from(map.values());

      // Sort by createdAt descending
      merged.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                     (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                     (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      setProjects(merged);
      setLoading(false);
    };

    const qUid = query(
      collection(activeDb, "projects"),
      where("userId", "==", user.uid)
    );

    const unsubscribeUid = onSnapshot(
      qUid,
      (snapshot) => {
        projectsByUid = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        handleMerge(projectsByUid, projectsByEmail);
      },
      (error: any) => {
        if (error.code === "permission-denied") {
          console.warn("UID projects restricted");
        } else {
          console.error("Error fetching projects by UID:", error);
        }
      }
    );

    let unsubscribeEmail = () => {};
    if (user.email) {
      const qEmail = query(
        collection(activeDb, "projects"),
        where("email", "==", user.email)
      );

      unsubscribeEmail = onSnapshot(
        qEmail,
        (snapshot) => {
          projectsByEmail = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          handleMerge(projectsByUid, projectsByEmail);
        },
        (error: any) => {
          if (error.code === "permission-denied" && projectsByUid.length === 0) {
            console.warn("Email projects restricted, falling back gracefully.");
          } else if (error.code !== "permission-denied") {
            console.error("Error fetching projects by Email:", error);
          }
        }
      );
    }

    return () => {
      unsubscribeUid();
      unsubscribeEmail();
    };
  }, [user?.uid, user?.email]);

  const stages = [
    { key: "pending", label: t("stages.pending") },
    { key: "discovery", label: t("stages.discovery") },
    { key: "planning", label: t("stages.planning") },
    { key: "ui_ux", label: t("stages.ui_ux") },
    { key: "development", label: t("stages.development") },
    { key: "testing", label: t("stages.testing") },
    { key: "review", label: t("stages.review") },
    { key: "revision", label: t("stages.revision") },
    { key: "deployment", label: t("stages.deployment") },
    { key: "completed", label: t("stages.completed") },
  ];

  const getStageIndex = (status: string) => {
    if (!status) return 0;
    const s = status.toLowerCase();

    // Map any legacy or near-matching status strings
    let target = s;
    if (s === "new") target = "pending";
    if (s === "analysis") target = "planning";
    if (s === "design") target = "ui_ux";

    const index = stages.findIndex(
      (st) =>
        st.key === target ||
        target.includes(st.key) ||
        st.key.includes(target)
    );
    return index === -1 ? 0 : index;
  };

  return (
    <>
      <SEO 
        title={t("seo.title")}
        description={t("seo.description")}
      />
      <section className="py-24 bg-[#030712] min-h-dvh relative pt-32 overflow-hidden">
        {/* Premium Background Ambience */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[600px] bg-primary/5 blur-[150px] pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2"></div>


      <Container className="relative z-10">
        <Breadcrumbs
          items={[
            { label: t("breadcrumbs.home"), href: "/" },
            { label: t("breadcrumbs.portal") },
          ]}
        />

        <FadeUp>
          <div className="mb-14 flex items-end justify-between border-b border-white/[0.05] pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight mb-2">
                {t("headings.workspace")}
              </h1>
              <p className="text-slate-400 font-light text-lg">
                {t("headings.welcome", { name: userData?.fullName || t("placeholders.partner") })}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] uppercase tracking-widest font-bold text-slate-500 bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-full">
              <ShieldCheck size={14} className="text-primary" /> {t("status.secure_tunnel")}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.05}>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveView("overview")}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                activeView === "overview" 
                  ? "bg-primary text-white" 
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {t("tabs.overview", "Overview")}
            </button>
            <button
              onClick={() => setActiveView("messaging")}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                activeView === "messaging" 
                  ? "bg-primary text-white" 
                  : "bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <MessageSquare size={14} /> {t("tabs.messaging", "Messages")}
            </button>
          </div>
        </FadeUp>

        {activeView === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
            <FadeUp delay={0.1}>
              <div className="flex items-center justify-between mb-0 md:mb-2 bg-white/[0.02] md:bg-transparent border border-white/[0.05] md:border-transparent rounded-2xl p-4 md:p-0">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {t("headings.active_engagements")}
                </h2>
                {projects.length > 0 && !projects[0].isError && (
                  <Link to="/#contact">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full md:bg-transparent md:px-0">
                      {t("actions.request_build")} <ArrowRight size={12} />
                    </span>
                  </Link>
                )}
              </div>
            </FadeUp>

            {loading ? (
              <div className="w-full animate-pulse space-y-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] w-full"
                  ></div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <FadeUp delay={0.2}>
                <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-[2.5rem] p-8 md:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.05] shadow-inner flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <Box className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display text-white mb-4 relative z-10 tracking-tight px-4">
                    {t("empty_state.title")}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400 font-light mb-10 max-w-md relative z-10 leading-relaxed px-2">
                    {t("empty_state.description")}
                  </p>
                  <Link to="/#contact" className="relative z-10 w-full md:w-auto">
                    <Button
                      variant="primary"
                      className="w-full md:w-auto uppercase tracking-widest text-[11px] font-bold h-14 md:h-12 px-8 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 rounded-2xl"
                    >
                      {t("actions.initiate_discovery")}
                    </Button>
                  </Link>
                </Card>
              </FadeUp>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {projects.map((proj, i) => {
                  const currentStageIndex = getStageIndex(proj.status);
                  const detailedPill = getDetailedStatusPill(proj.status);

                  return (
                    <FadeUp key={proj.id} delay={0.1 + i * 0.1}>
                      <Card
                        className={`bg-white/[0.015] border-white/[0.05] shadow-none rounded-[2rem] overflow-hidden transition-all duration-500 relative group flex flex-col ${proj.isError ? "border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]" : "hover:border-white/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.03)]"}`}
                      >
                        {/* Premium Top Highlight */}
                        <div
                          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${proj.isError ? "from-red-500/50 to-transparent" : "from-primary/50 to-transparent"} opacity-50`}
                        ></div>

                        <div className="p-6 md:p-10 flex flex-col flex-grow">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 md:mb-10">
                            <div>
                              <h3
                                className={`text-2xl md:text-3xl font-display tracking-tight transition-colors mb-3 md:mb-2 ${proj.isError ? "text-red-400 font-mono" : "text-white"}`}
                              >
                                {proj.company || t("placeholders.classified_build")}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2.5 py-1 md:py-0.5 rounded-lg md:rounded border border-primary/20">
                                  {proj.projectType || t("placeholders.platform")}
                                </span>
                                <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-widest text-slate-500 px-2.5 py-1 bg-white/[0.02] rounded-lg md:bg-transparent md:p-0 border border-white/5 md:border-transparent">
                                  {proj.industry || t("placeholders.na")}
                                </span>
                              </div>
                            </div>

                            {/* Live Status indicator */}
                            <div className="flex flex-row items-center gap-2 mt-2 md:mt-0">
                              <div
                                className={`flex flex-1 md:flex-none items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-3 py-2 md:py-1.5 rounded-xl border shadow-sm ${proj.isError ? "bg-red-500/10 border-red-500/20 text-red-400" : detailedPill.bgClass}`}
                              >
                                {!proj.isError && (
                                  <span className={`w-1.5 h-1.5 rounded-full ${detailedPill.dotClass} block`}></span>
                                )}
                                {proj.isError ? t("placeholders.error") : detailedPill.label}
                              </div>
                              {!proj.isError && (
                                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-slate-400 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
                                  Stage: {proj.status || t("placeholders.new")}
                                </span>
                              )}
                            </div>
                          </div>

                          {proj.isError ? (
                            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-sm text-slate-300">
                              <p className="mb-2 font-medium">
                                {t("placeholders.details_unavailable")}
                              </p>
                              <p className="opacity-70 text-xs">
                                {t("placeholders.restricted_init")}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col flex-grow">
                              {/* Linear Progress Tracking */}
                              <div className="mb-8 md:mb-10 block">
                                <div className="flex justify-between items-end mb-3">
                                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                                    {t("metrics.velocity")}
                                  </p>
                                  <p className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                    {Math.round(
                                      ((currentStageIndex + 1) /
                                        stages.length) *
                                        100,
                                    )}
                                    % {t("metrics.clr")}
                                  </p>
                                </div>
                                
                                {/* Desktop Horizontal Ribbon */}
                                <div className="relative hidden md:block">
                                  {/* Track Line */}
                                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/[0.05] -translate-y-1/2"></div>
                                  {/* Active Track Line */}
                                  <div
                                    className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                                    style={{
                                      width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                                    }}
                                  ></div>
                                  {/* Nodes */}
                                  <div className="relative flex justify-between">
                                    {stages.map((stage, idx) => {
                                      const isCompleted =
                                        idx < currentStageIndex;
                                      const isCurrent =
                                        idx === currentStageIndex;
                                      return (
                                        <div
                                          key={stage.key}
                                          className="flex flex-col items-center group/node relative"
                                        >
                                          <div
                                            className={`w-3 h-3 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${isCompleted ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" : isCurrent ? "bg-[#030712] border-[3px] border-primary scale-125" : "bg-[#030712] border-2 border-white/20"}`}
                                          >
                                            {isCompleted && (
                                              <CheckCircle className="w-2 h-2 text-white" />
                                            )}
                                          </div>
                                          {/* Tooltip purely CSS based */}
                                          <div className="absolute -top-10 bg-white text-black text-[9px] uppercase tracking-widest font-bold py-1 px-3 rounded shadow-xl opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                            {stage.label}
                                          </div>
                                          <span
                                            className={`text-[9px] uppercase tracking-widest font-bold mt-4 absolute top-2 transition-colors ${isCurrent ? "text-white" : "text-slate-600"}`}
                                          >
                                            {isCurrent ? stage.label : ""}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Mobile High-Contrast Milestone Stepper Grid */}
                                <div className="md:hidden space-y-4">
                                  <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-5 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                                          {t("metrics.current_milestone")}
                                        </p>
                                        <p className="text-lg font-semibold text-white tracking-tight">
                                          {stages[currentStageIndex]?.label || t("placeholders.na")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3">
                                       <div 
                                         className="h-full bg-primary" 
                                         style={{width: `${((currentStageIndex + 1) / stages.length) * 100}%`}}></div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex justify-between items-center w-full">
                                      <span className="truncate pr-2">{t("metrics.next")}: <span className="text-white">{stages[currentStageIndex + 1] ? stages[currentStageIndex + 1].label : t("placeholders.none")}</span></span>
                                      <span className="font-mono bg-white/5 px-2 py-1 rounded text-slate-300 flex-shrink-0">{currentStageIndex + 1}/{stages.length}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Project Metadata Grid */}
                              <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/5">
                                <div className="bg-white/[0.01] p-4 rounded-2xl md:p-0 md:bg-transparent md:rounded-none border border-white/[0.02] md:border-none">
                                  <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 md:mb-2 text-center md:text-left">
                                    {t("metrics.budget")}
                                  </p>
                                  <p className="text-sm md:text-base text-white font-mono object-contain text-center md:text-left">
                                    {proj.budget || t("placeholders.tbd")}
                                  </p>
                                </div>
                                <div className="bg-white/[0.01] p-4 rounded-2xl md:p-0 md:bg-transparent md:rounded-none border border-white/[0.02] md:border-none">
                                  <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 md:mb-2 text-center md:text-left">
                                    {t("metrics.scope")}
                                  </p>
                                  <p className="text-sm md:text-base text-white font-mono text-center md:text-left">
                                    {proj.timeline || t("placeholders.tbd")}
                                  </p>
                                </div>
                                <div className="col-span-2 lg:col-span-2 bg-white/[0.01] p-4 rounded-2xl md:p-0 md:bg-transparent md:rounded-none border border-white/[0.02] md:border-none flex items-center justify-between md:block">
                                  <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 md:mb-2 mb-0">
                                    {t("metrics.commencement")}
                                  </p>
                                  <p className="text-xs md:text-sm text-slate-400 font-mono">
                                    {proj.createdAt
                                      ? proj.createdAt
                                          .toDate()
                                          .toLocaleDateString(i18n.language === 'fr' ? "fr-FR" : "en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                      : t("placeholders.just_now")}
                                  </p>
                                </div>
                              </div>

                              {/* Client Action Panel (Thumb Friendly) */}
                              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/5">
                                {deletingId === proj.id ? (
                                  <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 bg-red-950/20 border border-red-500/20 p-3 sm:px-4 sm:py-2 rounded-[1.5rem] sm:rounded-2xl animate-pulse">
                                    <span className="text-xs text-red-300 font-mono text-center sm:text-left w-full sm:w-auto">{t("actions.decommission_build")}</span>
                                    <div className="flex w-full sm:w-auto gap-2">
                                      <button
                                        onClick={async () => {
                                          setIsDeleting(true);
                                          try {
                                            await projectService.deleteProject(proj.id);
                                          } catch (e) {
                                            console.error(e);
                                          } finally {
                                            setIsDeleting(false);
                                            setDeletingId(null);
                                          }
                                        }}
                                        disabled={isDeleting}
                                        className="flex-1 sm:flex-none justify-center items-center gap-1.5 px-4 h-10 sm:h-auto sm:py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl sm:rounded-lg transition-colors cursor-pointer"
                                      >
                                        {isDeleting ? "..." : t("actions.confirm")}
                                      </button>
                                      <button
                                        onClick={() => setDeletingId(null)}
                                        disabled={isDeleting}
                                        className="flex-1 sm:flex-none justify-center h-10 sm:h-auto sm:px-2 sm:py-1 text-[10px] uppercase tracking-wider text-slate-400 hover:text-white bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none transition-colors cursor-pointer"
                                      >
                                        {t("actions.cancel")}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingId(proj.id)}
                                    className="flex items-center justify-center w-full md:w-auto gap-1.5 px-4 h-12 md:h-9 bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer"
                                  >
                                    <Trash2 size={13} className="hidden md:inline" />
                                    {t("actions.delete_request")}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </FadeUp>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            <FadeUp delay={0.3}>
              <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-[2rem] p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors duration-700"></div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 md:mb-8 flex items-center border-b border-white/[0.05] pb-4">
                  <Activity size={14} className="text-primary mr-2" /> {t("headings.intelligence")}
                </h3>

                {projects.length > 0 && !projects[0].isError ? (
                  <div className="space-y-6 md:space-y-6 relative z-10 pl-2">
                    <div className="relative">
                      <div className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] pulse-glow"></div>
                      <div className="absolute left-[-13px] top-3 bottom-[-24px] w-[1px] bg-white/[0.05]"></div>
                      <p className="text-[13px] md:text-sm text-white font-medium mb-1 tracking-wide">
                        {t("intelligence.synchronized")}
                      </p>
                      <p className="text-[10px] md:text-[11px] font-mono text-emerald-400">
                        {t("status.nominal")}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20"></div>
                      <div className="absolute left-[-13px] top-3 bottom-[-24px] w-[1px] bg-white/[0.05]"></div>
                      <p className="text-[13px] md:text-sm text-slate-300 font-medium mb-1 tracking-wide">
                        {t("intelligence.review")}
                      </p>
                      <p className="text-[10px] md:text-[11px] font-mono text-slate-500">
                        {t("status.pending")}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20"></div>
                      <p className="text-[13px] md:text-sm text-slate-400 font-medium mb-1 tracking-wide">
                        {t("intelligence.discovery_call")}
                      </p>
                      <p className="text-[10px] md:text-[11px] font-mono text-slate-600">
                        {t("status.locked")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-slate-500 text-sm font-light leading-relaxed">
                      {t("status.offline")}
                    </p>
                  </div>
                )}
              </Card>
            </FadeUp>

            <FadeUp delay={0.4}>
                    <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-[2rem] p-6 md:p-8 hover:border-white/10 transition-colors group relative overflow-hidden">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6 md:mb-8 border-b border-white/[0.05] pb-4">
                        {t("headings.support")}
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 flex-col lg:flex-row">
                          <div className="w-12 h-12 md:w-10 md:h-10 rounded-2xl md:rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 md:w-4 md:h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-[13px] md:text-sm text-white font-medium tracking-wide mb-1">
                              {t("support_cards.line")}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed font-light mb-3">
                              {t("support_cards.line_desc")}
                            </p>
                            <a
                              href="mailto:einortsolutions237@gmail.com"
                              className="text-[10px] md:text-[11px] uppercase font-bold tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1 bg-white/[0.02] inline-flex px-3 py-1.5 rounded-lg border border-white/5"
                            >
                              {t("actions.legacy_email")} <ArrowRight size={10} />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 md:w-10 md:h-10 rounded-2xl md:rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 md:w-4 md:h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[13px] md:text-sm text-white font-medium tracking-wide mb-1">
                              {t("support_cards.syncs")}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed font-light">
                              {t("support_cards.syncs_desc")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
            </FadeUp>
          </div>
        </div>
        ) : (
          <FadeUp delay={0.1}>
            <div className="h-[600px] md:h-[700px] w-full rounded-[2rem] overflow-hidden border border-white/[0.05] bg-white/[0.015]">
              <ClientMessenger 
                userId={user?.uid || ""} 
                userEmail={user?.email || ""} 
                userName={userData?.fullName || "Partner"} 
              />
            </div>
          </FadeUp>
        )}
      </Container>
      </section>
    </>
  );
}
