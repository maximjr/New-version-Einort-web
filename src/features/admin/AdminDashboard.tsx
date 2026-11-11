import { Container } from "../../components/layout/Container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { FadeUp } from "../../components/animations/FadeUp";
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SEO } from "../../components/seo/SEO";
import { ProjectStatus } from "../../types";
import {
  Users,
  Briefcase,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Target,
  DollarSign,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Breadcrumbs } from "../../components/ui/Breadcrumbs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { ProjectTimeline } from "../../components/ui/ProjectTimeline";

// Enterprise Service Layer Upgrades
import { projectService } from "../../services/admin/projectService";
import { clientService } from "../../services/admin/clientService";
import { activityService } from "../../services/admin/activityService";
import { analyticsService } from "../../services/admin/analyticsService";
import { notificationService } from "../../services/admin/notificationService";
import { messageService } from "../../services/admin/messageService";
import { AdminMessenger } from "./AdminMessenger";
import { useMessaging } from "../../hooks/useMessaging";

import { useTranslation } from "react-i18next";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#64748b",
];

export function AdminDashboard() {
  const { t } = useTranslation("admin");
  
  const getDetailedStatusPill = (status: string) => {
    const currentStatus = (status || "pending").toLowerCase();
    
    if (currentStatus === "cancelled") {
      return {
        label: t("status.cancelled"),
        bgClass: "bg-red-500/10 text-red-400 border-red-500/20",
        dotClass: "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      };
    }
    
    const pendingStages = ["pending", "new", "discovery"];
    const completedStages = ["completed", "launched", "deployment"];
    
    if (pendingStages.includes(currentStatus)) {
      return {
        label: t("status.pending_review"),
        bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse",
      };
    }
    
    if (completedStages.includes(currentStatus)) {
      return {
        label: t("status.completed"),
        bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      };
    }
    
    return {
      label: t("status.in_progress"),
      bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      dotClass: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse",
    };
  };

  const location = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [syncingProjects, setSyncingProjects] = useState<Record<string, boolean>>({});
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<"analytics" | "messaging">("analytics");
  const [unreadTotalCount, setUnreadTotalCount] = useState(0);

  const { conversations } = useMessaging();
  const [resolvedAdminId, setResolvedAdminId] = useState<string>("super_admin");

  useEffect(() => {
    if (location.hash === "#messages") {
      setActiveView("messaging");
    } else if (location.hash === "#projects" || location.hash === "") {
      setActiveView("analytics");
    }
  }, [location.hash]);

  useEffect(() => {
    async function initAdmin() {
      try {
        const id = await messageService.getSuperAdminUid();
        setResolvedAdminId(id);
      } catch (err) {
        console.warn("Failed to resolve global admin id", err);
      }
    }
    initAdmin();
  }, []);

  useEffect(() => {
    // Calculate global aggregate unread count across all clients for this user
    const adminId = resolvedAdminId;
    const sum = conversations.reduce((acc, c) => acc + (c.unreadCount?.[adminId] || 0), 0);
    setUnreadTotalCount(sum);
  }, [conversations, resolvedAdminId]);

  useEffect(() => {
    setLoading(true);
    setLoadingUsers(true);

    const unsubscribeProjects = projectService.subscribeProjects(
      (data) => {
        setProjects(data);
        setLoading(false);
        setSyncError(null);
      },
      (err) => {
        const errMessage = err instanceof Error ? err.message : String(err);
        setSyncError(notificationService.mapSyncError(errMessage));
        setLoading(false);
      }
    );

    const unsubscribeClients = clientService.subscribeClients(
      (data) => {
        setUsers(data);
        setLoadingUsers(false);
      },
      (err) => {
        const errMessage = err instanceof Error ? err.message : String(err);
        setSyncError(notificationService.mapSyncError(errMessage));
        setLoadingUsers(false);
      }
    );

    const unsubscribeActivities = activityService.subscribeActivities(
      (data) => {
        setActivities(data);
      },
      () => {
        // Silently capture activity pipeline issues
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeClients();
      unsubscribeActivities();
    };
  }, []);

  const activeClientsCount = useMemo(
    () => users.filter((u) => u.role === "client" || !u.role).length,
    [users],
  );

  const industryData = useMemo(
    () => analyticsService.getAggregation(projects, "industry"),
    [projects],
  );
  const budgetData = useMemo(
    () => analyticsService.getAggregation(projects, "budget"),
    [projects],
  );
  const timelineData = useMemo(
    () => analyticsService.getAggregation(projects, "timeline"),
    [projects],
  );
  const statusData = useMemo(
    () => analyticsService.getAggregation(projects, "status"),
    [projects],
  );

  const averageLeadScore = useMemo(
    () => analyticsService.calculateAverageLeadScore(projects),
    [projects],
  );

  const totalPipelineValue = useMemo(
    () => analyticsService.calculateTotalPipeline(projects),
    [projects],
  );

  const formatCurrency = analyticsService.formatCurrency;
  const getRiskLevel = analyticsService.getRiskLevel;

  const { abandonedPrototypes, conversionRate } = useMemo(
    () => analyticsService.calculateCRMStats(projects, activeClientsCount),
    [projects, activeClientsCount]
  );

  const urgentProjectsCount = useMemo(
    () => projects.filter((p) => p.urgency === "high").length,
    [projects],
  );

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    setSyncingProjects((prev) => ({ ...prev, [projectId]: true }));

    const originalProjects = [...projects];

    // Optimistic responsive UI transition
    setProjects((prevProjects) =>
      prevProjects.map((proj) =>
        proj.id === projectId ? { ...proj, status: newStatus } : proj,
      ),
    );

    const result = await projectService.updateStatus(projectId, newStatus as ProjectStatus);

    if (!result.success) {
      console.warn("[Orchestration Deviance]", result.message);
      setSyncError(`Status state transition rejected. ${result.message}`);
      setProjects(originalProjects);
    } else {
      setSyncError(null);
      console.log(`Successfully orchestrated project ${projectId} status change to: ${newStatus}`);
    }

    setTimeout(() => {
      setSyncingProjects((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    }, 600);
  };

  return (
    <>
      <SEO 
        title={t("seo.title")}
        description={t("seo.description")}
      />
      <section className="py-24 bg-surface min-h-[80vh] relative pt-32">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2"></div>

      <Container>
        <Breadcrumbs
          items={[
            { label: t("breadcrumbs.home"), href: "/" },
            { label: t("breadcrumbs.admin") },
          ]}
        />

        <FadeUp>
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-medium text-white mb-4 flex items-center gap-4">
                {t("headings.command_center")}
              </h1>
              <p className="text-text-muted font-light text-lg">
                {t("headings.operating_system")}
              </p>
            </div>
            {syncError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-red-500 text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <AlertTriangle size={18} className="text-red-500" />
                <p className="font-medium tracking-wide">
                  {t("notices.system_degraded")}{" "}
                  {syncError.includes("Security Rules")
                    ? t("notices.iam_error")
                    : ""}
                </p>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Navigation Tab Controllers */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 md:gap-4 border-b border-white/[0.05] pb-6 mb-8 select-none">
          <button
            onClick={() => setActiveView("analytics")}
            className={`min-h-[44px] justify-center px-4 md:px-5 py-2.5 rounded-xl border-2 md:border text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeView === "analytics"
                ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white/[0.015] border-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.analytics")}</span>
            <span className="sm:hidden">{t("tabs.analytics_short")}</span>
          </button>
          
          <button
            onClick={() => setActiveView("messaging")}
            className={`min-h-[44px] justify-center px-4 md:px-5 py-2.5 rounded-xl border-2 md:border text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative cursor-pointer ${
              activeView === "messaging"
                ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white/[0.015] border-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.messaging")}</span>
            <span className="sm:hidden">{t("tabs.messages_short")}</span>
            {unreadTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-cyan-400 text-[#030712] text-[9px] font-bold w-4 h-4 rounded-full font-mono shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse shrink-0">
                {unreadTotalCount}
              </span>
            )}
          </button>
        </div>

        {activeView === "messaging" ? (
          <FadeUp>
            <AdminMessenger clients={users.filter(u => u.role === "client" || !u.role)} currentAdminId={resolvedAdminId} />
          </FadeUp>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          {[
            {
              label: t("stats.active_projects"),
              value: projects.length,
              trend: t("stats.trends.live"),
              icon: <Briefcase className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
              border: "border-blue-400/20",
            },
            {
              label: t("stats.revenue_pipeline"),
              value: formatCurrency(totalPipelineValue),
              trend: t("stats.trends.volume"),
              icon: <DollarSign className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
              border: "border-emerald-400/20",
            },
            {
              label: t("stats.high_priority"),
              value: urgentProjectsCount,
              trend: t("stats.trends.urgent"),
              icon: <Zap className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-orange-400",
              bg: "bg-orange-400/10",
              border: "border-orange-400/20",
            },
            {
              label: t("stats.conversion_rate"),
              value: `${conversionRate}%`,
              trend: t("stats.trends.avg"),
              icon: <Target className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
              border: "border-purple-400/20",
            },
            {
              label: t("stats.active_clients"),
              value: loadingUsers ? "-" : activeClientsCount,
              trend: t("stats.trends.users"),
              icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-cyan-400",
              bg: "bg-cyan-400/10",
              border: "border-cyan-400/20",
            },
            {
              label: t("stats.avg_lead_score"),
              value: loading ? "-" : averageLeadScore,
              trend: t("stats.trends.score"),
              icon: <Activity className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-indigo-400",
              bg: "bg-indigo-400/10",
              border: "border-indigo-400/20",
            },
            {
              label: t("stats.abandoned_drafts"),
              value: abandonedPrototypes,
              trend: t("stats.trends.lost"),
              icon: <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />,
              color: "text-red-400",
              bg: "bg-red-400/10",
              border: "border-red-400/20",
            },
            {
              label: t("stats.system_health"),
              value: syncError ? t("stats.health_status.degraded") : t("stats.health_status.nominal"),
              trend: t("stats.trends.ops"),
              icon: <Activity className="w-4 h-4 md:w-5 md:h-5" />,
              color: syncError ? "text-red-400" : "text-green-400",
              bg: syncError ? "bg-red-400/10" : "bg-green-400/10",
              border: syncError ? "border-red-400/20" : "border-green-400/20",
            },
          ].map((stat, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <Card className="bg-white/[0.015] border-white/[0.05] hover:border-white/10 transition-all relative overflow-hidden group shadow-none hover:shadow-2xl hover:shadow-primary/5 rounded-[1.5rem] md:rounded-[2rem]">
                <div
                  className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 ${stat.bg} blur-[60px] -mt-10 -mr-10 transition-all duration-500 opacity-30 group-hover:opacity-80 scale-100 group-hover:scale-150`}
                ></div>
                <CardContent className="p-4 md:p-6 relative z-10 flex flex-col justify-between min-h-[110px] md:min-h-[140px]">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.bg} ${stat.border} border ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                    <span
                      className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold ${stat.color} bg-white/5 px-1.5 md:px-2 py-[2px] md:py-0.5 rounded-full border border-white/5 shadow-sm transform scale-90 md:scale-100 origin-top-right`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-3xl font-mono text-white tracking-tight mb-0.5 font-medium md:font-normal">
                      {stat.value}
                    </h3>
                    <p className="text-[9px] md:text-[11px] uppercase tracking-widest text-slate-400 font-semibold md:font-medium leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeUp>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          <FadeUp delay={0.2}>
            <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl h-full flex flex-col">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                  {t("charts.sector_concentration")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="h-[250px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {industryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-6 justify-center">
                  {industryData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-slate-300">{entry.name}</span>
                      <span className="text-slate-500 font-mono">
                        ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          <FadeUp delay={0.3}>
            <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl h-full flex flex-col">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                  {t("charts.value_allocation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#1e293b" }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          <FadeUp delay={0.4}>
            <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl h-full flex flex-col">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                  {t("charts.delivery_trajectory")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {timelineData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[(index + 3) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-6 justify-center">
                  {timelineData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[(index + 3) % COLORS.length],
                        }}
                      ></div>
                      <span className="text-slate-300">{entry.name}</span>
                      <span className="text-slate-500 font-mono">
                        ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeUp>

          <FadeUp delay={0.5}>
            <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl h-full flex flex-col">
              <CardHeader className="border-b border-white/[0.05] pb-4">
                <CardTitle className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
                  {t("charts.operational_status")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-6">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#1e293b" }}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </FadeUp>
        </div>

        <FadeUp delay={0.6}>
          <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-[2rem] overflow-hidden mb-6">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01] p-6 lg:p-8">
              <CardTitle className="text-lg font-medium text-white flex items-center justify-between">
                <span>{t("headings.pipeline_title")}</span>
                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-slate-400 border border-white/5">{projects.length} {t("table.total")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="w-full animate-pulse p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-2xl w-full"></div>
                    ))}
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  {t("notices.no_projects")}
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="lg:hidden flex flex-col p-4 space-y-4">
                    {projects.map((proj) => {
                      const risk = getRiskLevel(proj);
                      const detailedPill = getDetailedStatusPill(proj.status);
                      const isExpanded = expandedProject === proj.id;
                      return (
                        <div key={`m-${proj.id}`} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden shadow-sm">
                          <div 
                            onClick={() => setExpandedProject(isExpanded ? null : proj.id)}
                            className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4 gap-4">
                              <div className="min-w-0">
                                <h4 className="text-lg font-display text-white truncate mb-1">{proj.company || t("placeholders.classified_build")}</h4>
                                <span className="text-xs text-slate-400 capitalize">{proj.industry || t("placeholders.na")} • {proj.projectType}</span>
                              </div>
                              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase font-bold tracking-widest rounded-lg border shadow-sm ${detailedPill.bgClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${detailedPill.dotClass}`}></span>
                                  {detailedPill.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span
                                className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${proj.urgency === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : proj.urgency === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-primary/10 text-primary border-primary/20"}`}
                              >
                                {proj.urgency || t("placeholders.normal_urgency")} Urg
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${risk.color}`}
                              >
                                {risk.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                               <div>
                                 <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{t("table.budget", { defaultValue: "Budget" })}</p>
                                 <p className="font-mono text-sm text-slate-200">{proj.budget || "N/A"}</p>
                               </div>
                               <div>
                                 <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{t("table.client")}</p>
                                 <p className="text-sm text-slate-200 truncate">{proj.clientName || "Unknown"}</p>
                               </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden bg-[#070b14] border-t border-white/[0.05]"
                              >
                                <div className="p-5 flex flex-col gap-5">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-1 font-mono">{t("actions.command")}</p>
                                  </div>
                                  
                                  <div className="w-full">
                                    <select
                                      value={proj.status || "pending"}
                                      disabled={syncingProjects[proj.id]}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(proj.id, e.target.value);
                                      }}
                                      className="w-full bg-white/[0.02] border border-white/10 text-slate-200 text-sm rounded-xl px-4 py-3.5 outline-none cursor-pointer uppercase tracking-wider appearance-none shadow-sm font-sans mb-3"
                                    >
                                      {[
                                        { value: "pending", label: t("stages.pending") },
                                        { value: "discovery", label: t("stages.discovery") },
                                        { value: "planning", label: t("stages.planning") },
                                        { value: "ui_ux", label: t("stages.ui_ux") },
                                        { value: "development", label: t("stages.development") },
                                        { value: "testing", label: t("stages.testing") },
                                        { value: "review", label: t("stages.review") },
                                        { value: "revision", label: t("stages.revision") },
                                        { value: "deployment", label: t("stages.deployment") },
                                        { value: "completed", label: t("stages.completed") },
                                        { value: "cancelled", label: t("stages.cancelled") },
                                      ].map((option) => (
                                        <option key={option.value} value={option.value} className="bg-slate-950 text-white font-sans">
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    {(() => {
                                          const currentStatus = (proj.status || "pending").toLowerCase();
                                          let currentTarget = currentStatus;
                                          if (currentStatus === "new") currentTarget = "pending";
                                          if (currentStatus === "consultation") currentTarget = "planning";
                                          if (currentStatus === "design" || currentStatus === "analysis") currentTarget = "ui_ux";
                                          
                                          const orderedStages = [
                                            "pending", "discovery", "planning", "ui_ux", "development", "testing", "review", "revision", "deployment", "completed"
                                          ];

                                          const currentIndex = orderedStages.indexOf(currentTarget);
                                          let buttonText = t("actions.accept_deal");
                                          let nextStatusVal = "discovery";
                                          let isCompleted = currentTarget === "completed";

                                          if (currentIndex !== -1 && currentIndex < orderedStages.length - 1) {
                                            const nextStatus = orderedStages[currentIndex + 1];
                                            const nextLabel = t(`stages.${nextStatus}`).split(". ")[1].replace("_", "/").toUpperCase();
                                            buttonText = t("actions.advance_to", { stage: nextLabel });
                                            nextStatusVal = nextStatus;
                                          } else if (currentTarget === "completed") {
                                            buttonText = t("actions.fully_completed");
                                          } else if (currentTarget === "cancelled") {
                                            buttonText = t("actions.reactivate");
                                            nextStatusVal = "pending";
                                            isCompleted = false;
                                          }

                                          const isThisSyncing = syncingProjects[proj.id];

                                          return (
                                            <button
                                              disabled={isCompleted || isThisSyncing}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isCompleted && !isThisSyncing) {
                                                  handleUpdateStatus(proj.id, nextStatusVal);
                                                }
                                              }}
                                              className={`w-full flex justify-center items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-5 h-12 rounded-xl transition-all ${
                                                isCompleted
                                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                                                  : isThisSyncing
                                                  ? "bg-slate-800 text-slate-400 border border-white/5 cursor-wait"
                                                  : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.30)]"
                                              }`}
                                            >
                                              {isThisSyncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
                                              {isThisSyncing ? t("notices.syncing") : buttonText}
                                            </button>
                                          );
                                      })()}
                                  </div>
                                  
                                  {/* Mobile Delete Button */}
                                  <div className="flex justify-end pt-4 border-t border-white/5">
                                    {deletingProjectId === proj.id ? (
                                      <div className="flexflex-col w-full gap-3 bg-red-950/20 border border-red-500/20 p-4 rounded-xl animate-pulse">
                                        <span className="text-red-300 font-mono text-[10px] block mb-3 text-center uppercase tracking-widest font-bold">{t("notices.decommission_confirm")}</span>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setIsDeleting(true);
                                              try {
                                                await projectService.deleteProject(proj.id);
                                                setExpandedProject(null);
                                              } catch (err) {
                                                console.error(err);
                                              } finally {
                                                setIsDeleting(false);
                                                setDeletingProjectId(null);
                                              }
                                            }}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 h-12 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                          >
                                            {isDeleting ? "..." : t("actions.confirm")}
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setDeletingProjectId(null); }}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 h-12 bg-white/5 text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                                          >
                                            {t("actions.cancel")}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingProjectId(proj.id); }}
                                        className="h-12 w-full flex items-center justify-center gap-1.5 px-4 bg-white/[0.02] border border-white/5 text-slate-400 hover:text-red-400 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                      >
                                        {t("actions.delete_project")}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto" data-lenis-prevent="true">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/[0.05]">
                        <tr>
                          <th className="px-4 py-3">{t("table.client")}</th>
                          <th className="px-4 py-3">{t("table.industry")}</th>
                          <th className="px-4 py-3">{t("table.type")}</th>
                          <th className="px-4 py-3">{t("table.budget_timeline")}</th>
                          <th className="px-4 py-3">{t("table.urgency_risk")}</th>
                          <th className="px-4 py-3 max-w-[200px]">
                            {t("table.requirements")}
                          </th>
                          <th className="px-4 py-3">{t("table.lead_score")}</th>
                          <th className="px-4 py-3">{t("table.status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                      {projects.map((proj) => {
                        const risk = getRiskLevel(proj);
                        const detailedPill = getDetailedStatusPill(proj.status);
                        return (
                          <React.Fragment key={proj.id}>
                            <tr
                              onClick={() =>
                                setExpandedProject(
                                  expandedProject === proj.id ? null : proj.id,
                                )
                              }
                              className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-5">
                                <p className="font-medium text-white group-hover:text-primary transition-colors">
                                  {proj.clientName || t("placeholders.unknown")}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono mt-1">
                                  {proj.company || ""}
                                </p>
                              </td>
                              <td className="px-6 py-5 text-slate-400 capitalize">
                                {proj.industry || t("placeholders.na")}
                              </td>
                              <td className="px-6 py-5 text-slate-400 capitalize">
                                {proj.projectType}
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-white font-mono text-sm">
                                  {proj.budget || t("placeholders.na")}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono mt-1">
                                  {proj.timeline || t("placeholders.na")}
                                </p>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-2 items-start">
                                  <span
                                    className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${proj.urgency === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : proj.urgency === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-primary/10 text-primary border-primary/20"}`}
                                  >
                                    {proj.urgency || t("placeholders.normal_urgency")} {t("details.urgency", { defaultValue: "Urgency" })}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${risk.color}`}
                                  >
                                    {risk.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 max-w-[200px] truncate">
                                <span
                                  className="text-[11px] text-slate-500 tracking-wide"
                                  title={proj.requirements}
                                >
                                  {proj.requirements || t("placeholders.na")}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden max-w-[60px] border border-white/5">
                                    <div
                                      className={`h-full ${proj.leadScore >= 70 ? "bg-emerald-400" : proj.leadScore >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                                      style={{
                                        width: `${proj.leadScore || 0}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {proj.leadScore || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5 items-start">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded border shadow-sm ${detailedPill.bgClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${detailedPill.dotClass}`}></span>
                                    {detailedPill.label}
                                  </span>
                                  <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 ml-1">
                                    {t("details.stage")}: {proj.status || t("placeholders.unknown")}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {expandedProject === proj.id && (
                              <tr>
                                <td colSpan={8} className="p-0 border-0">
                                  <div className="bg-[#0a0f1d] border-b border-t border-white/[0.05] px-8 pt-6 pb-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
                                      <div>
                                        <p className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-1 font-mono">
                                          {t("actions.command_console")}
                                        </p>
                                        <h4 className="text-lg font-medium text-white font-display">
                                          {t("actions.orchestrator_audit")}
                                        </h4>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-3">
                                        {/* 11-Stage Pipeline Dropdown Selector */}
                                        <div className="relative inline-block">
                                          <select
                                            value={proj.status || "pending"}
                                            disabled={syncingProjects[proj.id]}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleUpdateStatus(proj.id, e.target.value);
                                            }}
                                            className="bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-slate-200 text-xs font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer uppercase tracking-wider appearance-none shadow-sm font-sans"
                                          >
                                            {[
                                              { value: "pending", label: "01. Pending Verification" },
                                              { value: "discovery", label: "02. Discovery Phase" },
                                              { value: "planning", label: "03. Architecture Planning" },
                                              { value: "ui_ux", label: "04. UI/UX Prototyping" },
                                              { value: "development", label: "05. Engineering & Dev" },
                                              { value: "testing", label: "06. Testing & QA" },
                                              { value: "review", label: "07. Governance Review" },
                                              { value: "revision", label: "08. Revision Loop" },
                                              { value: "deployment", label: "09. Deployment Prep" },
                                              { value: "completed", label: "10. Live / Completed" },
                                              { value: "cancelled", label: "11. Decommissioned / Cancelled" },
                                            ].map((option) => (
                                              <option key={option.value} value={option.value} className="bg-slate-950 text-white font-semibold font-sans">
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                                            ▼
                                          </div>
                                        </div>

                                        {/* Dynamic Stepping Button */}
                                        {(() => {
                                          const currentStatus = (proj.status || "pending").toLowerCase();
                                          
                                          // Normalise legacy or alternate states gracefully
                                          let currentTarget = currentStatus;
                                          if (currentStatus === "new") currentTarget = "pending";
                                          if (currentStatus === "consultation") currentTarget = "planning";
                                          if (currentStatus === "design" || currentStatus === "analysis") currentTarget = "ui_ux";
                                          
                                          const orderedStages = [
                                            "pending",
                                            "discovery",
                                            "planning",
                                            "ui_ux",
                                            "development",
                                            "testing",
                                            "review",
                                            "revision",
                                            "deployment",
                                            "completed"
                                          ];

                                          const currentIndex = orderedStages.indexOf(currentTarget);
                                          let buttonText = "Accept Deal";
                                          let nextStatusVal = "discovery";
                                          let isCompleted = currentTarget === "completed";

                                          if (currentIndex !== -1 && currentIndex < orderedStages.length - 1) {
                                            const nextStatus = orderedStages[currentIndex + 1];
                                            const nextLabel = nextStatus.replace("_", "/").toUpperCase();
                                            buttonText = `Advance to ${nextLabel}`;
                                            nextStatusVal = nextStatus;
                                          } else if (currentTarget === "completed") {
                                            buttonText = "Deal Fully Completed";
                                          } else if (currentTarget === "cancelled") {
                                            buttonText = "Re-Activate Project";
                                            nextStatusVal = "pending";
                                            isCompleted = false;
                                          }

                                          const isThisProjectSyncing = syncingProjects[proj.id];

                                          return (
                                            <button
                                              disabled={isCompleted || isThisProjectSyncing}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isCompleted && !isThisProjectSyncing) {
                                                  handleUpdateStatus(proj.id, nextStatusVal);
                                                }
                                              }}
                                              className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${
                                                isCompleted
                                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                                                  : isThisProjectSyncing
                                                  ? "bg-slate-800 text-slate-400 border border-white/5 cursor-wait"
                                                  : "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.30)] hover:scale-[1.02] active:scale-[0.98]"
                                              }`}
                                            >
                                              {isThisProjectSyncing && (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                              )}
                                              {isThisProjectSyncing ? t("notices.syncing") : buttonText}
                                            </button>
                                          );
                                        })()}

                                        {/* Decommission / Delete Project */}
                                        {deletingProjectId === proj.id ? (
                                          <div className="flex items-center gap-2 bg-red-950/20 border border-red-500/20 px-4 py-1.5 rounded-xl animate-pulse text-[11px] font-bold uppercase tracking-widest">
                                            <span className="text-red-300 font-mono text-[10px]">{t("notices.decommission_confirm")}</span>
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                setIsDeleting(true);
                                                try {
                                                  await projectService.deleteProject(proj.id);
                                                  setExpandedProject(null);
                                                } catch (err) {
                                                  console.error(err);
                                                } finally {
                                                  setIsDeleting(false);
                                                  setDeletingProjectId(null);
                                                }
                                              }}
                                              disabled={isDeleting}
                                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
                                            >
                                              {isDeleting ? "..." : t("actions.confirm")}
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingProjectId(null);
                                              }}
                                              disabled={isDeleting}
                                              className="px-2 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                            >
                                              {t("actions.cancel")}
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeletingProjectId(proj.id);
                                            }}
                                            className="flex items-center gap-1.5 px-5 py-2.5 bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer"
                                          >
                                            <Trash2 size={13} />
                                            {t("actions.decommission_workspace")}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="max-w-4xl mx-auto mb-6 bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                                      <ProjectTimeline status={proj.status} />
                                    </div>

                                    {/* Project Summary / Details Block inside index */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#94a3b8] mt-6 bg-[#0c1224] border border-white/5 rounded-2xl p-6">
                                      <div>
                                        <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">{t("details.client_details")}</h5>
                                        <p className="text-white font-medium">{proj.clientName || t("placeholders.unknown_client")}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-1">{proj.email || t("placeholders.no_email")}</p>
                                        {proj.company && <p className="text-xs text-slate-400 mt-1">{t("details.company")}: {proj.company}</p>}
                                      </div>
                                      <div>
                                        <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono font-semibold">{t("details.scope_timeline")}</h5>
                                        <p className="text-slate-300">{t("details.phase")}: <span className="text-white font-medium capitalize">{proj.projectType}</span></p>
                                        <p className="text-slate-300 mt-1">{t("details.budget_allocation")}: <span className="text-emerald-400 font-mono">{proj.budget || t("placeholders.na")}</span></p>
                                        <p className="text-slate-300 mt-1">{t("details.timeline_window")}: <span className="text-blue-400">{proj.timeline || t("placeholders.na")}</span></p>
                                      </div>
                                      <div>
                                        <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono font-semibold">{t("details.risk_auditing")}</h5>
                                        <div className="flex flex-col gap-1 text-xs">
                                          <p>{t("details.lead_quality_score")}: <span className="text-white font-mono">{proj.leadScore || t("placeholders.na")}/100</span></p>
                                          <p>{t("details.complexity_index")}: <span className="text-white font-mono">{proj.complexityScore || t("placeholders.na")}/10</span></p>
                                          <p className="mt-1">
                                            {t("details.status")}: <span className="px-2 py-0.5 rounded bg-white/5 text-white border border-white/10 uppercase tracking-widest text-[9px] font-bold">{proj.status || t("placeholders.unknown")}</span>
                                          </p>
                                        </div>
                                      </div>
                                      {proj.requirements && (
                                        <div className="col-span-1 md:col-span-3 border-t border-white/5 pt-4 mt-2">
                                          <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono font-semibold">{t("details.business_requirements")}</h5>
                                          <p className="text-slate-300 bg-white/[0.01] border border-white/5 p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap font-sans">
                                            {proj.requirements}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp delay={0.7}>
          <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl overflow-hidden mt-6 mb-6">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
              <CardTitle className="text-lg font-medium text-white">
                {t("client_base.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUsers ? (
                <div className="w-full animate-pulse">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white/[0.01] border-b border-white/[0.05]">
                      <tr>
                        {[...Array(5)].map((_, i) => (
                          <th key={i} className="px-6 py-4">
                            <div className="h-3 bg-white/[0.03] rounded w-20"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {[...Array(3)].map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-5">
                            <div className="h-4 bg-white/[0.05] rounded w-32 mb-2"></div>
                            <div className="h-3 bg-white/[0.03] rounded w-24"></div>
                          </td>
                          <td className="px-6 py-5"><div className="h-4 bg-white/[0.03] rounded w-24"></div></td>
                          <td className="px-6 py-5"><div className="h-5 bg-white/[0.03] rounded w-20"></div></td>
                          <td className="px-6 py-5"><div className="h-6 bg-white/[0.03] rounded w-12"></div></td>
                          <td className="px-6 py-5"><div className="h-4 bg-white/[0.03] rounded w-24"></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  {t("placeholders.no_clients")}
                </div>
              ) : (
                <>
                  <div className="lg:hidden flex flex-col p-4 space-y-4">
                    {users.map((u) => {
                      const userProjects = projects.filter((p) => p.userId === u.id).length;
                      return (
                        <div key={`mob-u-${u.id}`} className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-white mb-1">{u.name || t("placeholders.unknown")}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{u.email || ""}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${u.role === "super_admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : u.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-white/[0.02] text-slate-400 border-white/10"}`}>
                              {u.role || t("placeholders.role_client")}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-slate-500">{t("client_base.headers.account_type")}</p>
                              <p className="text-xs text-slate-300 capitalize mt-1">{u.accountType || t("placeholders.account_standard")}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-slate-500">{t("client_base.headers.projects")}</p>
                              <p className="text-xs text-slate-300 mt-1">{userProjects}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden lg:block overflow-x-auto" data-lenis-prevent="true">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/[0.05]">
                      <tr>
                        <th className="px-4 py-3">{t("client_base.headers.client")}</th>
                        <th className="px-4 py-3">{t("client_base.headers.account_type")}</th>
                        <th className="px-4 py-3">{t("client_base.headers.role")}</th>
                        <th className="px-4 py-3">{t("client_base.headers.projects")}</th>
                        <th className="px-4 py-3">{t("client_base.headers.registered")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => {
                        const userProjects = projects.filter(
                          (p) => p.userId === u.id,
                        ).length;
                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-5">
                              <p className="font-medium text-white">
                                {u.name || t("placeholders.unknown")}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono mt-1">
                                {u.email || ""}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-slate-400 capitalize">
                              {u.accountType || t("placeholders.account_standard")}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded border ${u.role === "super_admin" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : u.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-white/[0.02] text-slate-400 border-white/10"}`}
                              >
                                {u.role || t("placeholders.role_client")}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[11px] text-slate-300 bg-slate-800 border border-slate-700/50 px-2.5 py-1 rounded shadow-inner font-mono">
                                {userProjects}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-slate-400 font-mono text-[11px]">
                              {u.createdAt
                                ? u.createdAt.toDate?.().toLocaleDateString()
                                : "Internal"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        <FadeUp delay={0.8}>
          <Card className="bg-white/[0.015] border-white/[0.05] shadow-none rounded-2xl overflow-hidden mt-6">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.05] bg-white/[0.01]">
              <CardTitle className="text-lg font-medium text-white">
                {t("activity_feed.title")}
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.15)] pulse-glow">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                {t("activity_feed.system_stream")}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {activities.length === 0 ? (
                <div className="py-8 text-center border-t border-white/5 text-slate-500 text-sm">
                  {t("placeholders.waiting_activity")}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Activity size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm text-white font-medium">
                            {act.actionTitle || t("placeholders.system_event")}
                          </p>
                          <span className="text-xs font-mono text-slate-500">
                            {act.timestamp?.toDate
                              ? act.timestamp.toDate().toLocaleTimeString()
                              : "Just now"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {act.description}
                        </p>
                        {act.clientEmail && (
                          <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex gap-2 items-center">
                            <Users size={10} />
                            {act.clientEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
          </>
        )}
      </Container>
      </section>
    </>
  );
}
