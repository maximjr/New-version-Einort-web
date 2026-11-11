import { Project } from "../../types";

export interface AggregationData {
  name: string;
  value: number;
}

export interface RiskLevelInfo {
  label: string;
  color: string;
}

export const analyticsService = {
  /**
   * Helper to aggregate values in arrays cleanly for Pie/Bar charts.
   */
  getAggregation(arr: any[], key: string): AggregationData[] {
    const counts = arr.reduce(
      (acc, item) => {
        const val = item[key]
          ? String(item[key]).charAt(0).toUpperCase() + String(item[key]).slice(1)
          : "Unspecified";
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  },

  /**
   * Calculates total estimated financial pipeline value.
   */
  calculateTotalPipeline(projects: Project[]): number {
    return projects.reduce((acc, p) => {
      if (!p.budget) return acc;
      const budgetUpper = p.budget.toLowerCase();
      if (budgetUpper.includes("50k")) return acc + 50000;
      if (budgetUpper.includes("100k")) return acc + 100000;
      if (budgetUpper.includes("250k")) return acc + 250000;
      if (budgetUpper.includes("500k+")) return acc + 500000;
      return acc;
    }, 0);
  },

  /**
   * Standardized SaaS currency formatting for high readability.
   */
  formatCurrency(val: number): string {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  },

  /**
   * Evaluates deal status and assigns complexity/urgency risk index.
   */
  getRiskLevel(proj: Partial<Project>): RiskLevelInfo {
    let score = 0;
    if (proj.urgency === "high") score += 3;
    if (proj.leadScore && proj.leadScore < 40) score += 2;
    if (proj.budget && proj.budget.includes("500k+")) score += 1;

    if (score >= 4) {
      return {
        label: "High Risk",
        color: "text-red-400 bg-red-400/10 border-red-400/20",
      };
    }
    if (score >= 2) {
      return {
        label: "Elevated",
        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      };
    }
    return {
      label: "Stable",
      color: "text-green-400 bg-green-400/10 border-green-400/20",
    };
  },

  /**
   * Computes high-level CRM conversion rates and abandoned prototypes metrics.
   */
  calculateCRMStats(projects: Project[], activeClientsCount: number) {
    const clientsWithProjects = new Set(projects.map((p) => p.userId)).size;
    const abandonedPrototypes = Math.max(0, activeClientsCount - clientsWithProjects);
    const conversionRate =
      activeClientsCount > 0
        ? Math.round((clientsWithProjects / activeClientsCount) * 100)
        : 0;

    return {
      clientsWithProjects,
      abandonedPrototypes,
      conversionRate,
    };
  },

  /**
   * Calculates the average quality score of pipeline leads.
   */
  calculateAverageLeadScore(projects: Project[]): number {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((acc, p) => acc + (p.leadScore || 0), 0);
    return Math.round(sum / projects.length);
  }
};
